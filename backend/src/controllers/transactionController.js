const User = require('../models/User');
const UserTransaction = require('../models/UserTransaction');
const TopupPackage = require('../models/TopupPackage');
const applyPackageToBalance = require("../utils/applyPackageToBalance");
const applyReferralBonus = require("../utils/applyReferralBonus"); 
const autoUpgradeUserLevel = require("../utils/autoUpgradeUserLevel");
const ExchangerConfig = require("../models/ExchangerConfig");
const SbpSaleHistory = require("../models/SbpSaleHistory");
const addBalance = require("../utils/addBalance");
const UserBalance = require("../models/UserBalance");
const recordSbpHistory = require("../utils/recordSbpHistory");
const Decimal = require("decimal.js");

const getManualTopupRule = require("../utils/getManualTopupRule");
const axios = require("axios");
const { Op } = require("sequelize");

const manualTopupProcessor = require("../utils/manualTopupProcessor");
const packageTopupProcessor = require("../utils/packageTopupProcessor");





const {
  generateSignature,
  buildAuthorizationBase64,
  minifyJSON,
  getTimestamp
} = require('../utils/mpstoreUtils');
const grantSbpWithSource = require('../utils/grantSbpWithSource');

const userTopUp = async (req, res) => {
  try {
    const { amount, bankCode } = req.body;

    const parsedAmount = parseFloat(amount);
    const parsedBankCode = parseInt(bankCode);

    if (!parsedAmount || parsedAmount <= 0 || isNaN(parsedBankCode)) {
      return res.status(400).json({ error: "Invalid amount or bank code." });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    const timestamp = getTimestamp();
    const idtrx = `${Date.now()}-${user.id}`;
    const relativeUrl = "/api/serviceh2h/prod/dynamic-va";
    const targetUrl = `${process.env.MONEY_IN_MPSTORE_HOST}${relativeUrl}`;

const payload = {
  amount,
  idtrx,
  email: user.email,
  firstName: user.username,
  lastName: user.username,
  phoneNumber: user.phoneNumber || "081234567890",
  bankCode: parsedBankCode,
  ...(parsedBankCode === 9 && { merchantName: "BCAVA", jsonRes: "0" }),
  ...(parsedBankCode === 7 && { merchantName: "QRIS", jsonRes: "0" }),
};


    const minifiedBody = minifyJSON(payload);
    const credentials = {
      id: process.env.MONEY_IN_MPSTORE_ID,
      username: process.env.MONEY_IN_MPSTORE_USERNAME,
      password: process.env.MONEY_IN_MPSTORE_PASSWORD,
      pin: process.env.MONEY_IN_MPSTORE_PIN,
    };

    const signature = await generateSignature({
      method: "POST",
      relativeUrl,
      requestBodyObj: payload,
      timestamp,
      credentials,
    });

    const authBase64 = buildAuthorizationBase64(credentials);


    // ✅ Logging lengkap
    console.log(`[${timestamp}]
=== TOP-UP REQUEST ===
User: ${user.username} (${user.email})
Amount: ${parsedAmount}
Bank Code: ${parsedBankCode}
Transaction ID: ${idtrx}
Timestamp: ${timestamp}

🔐 Signature: ${signature}
📦 Raw Body:
${minifiedBody}

🛠 Headers:
- Content-Type: application/json
- Timestamp: ${timestamp}
- Signature: ${signature}
- Authorization: Basic ${authBase64}

Target URL: ${targetUrl}
=======================
`);

    const response = await axios.post(targetUrl, minifiedBody, {
      headers: {
        "Content-Type": "application/json",
        "Timestamp": timestamp,
        "Signature": signature,
        "Authorization": `Basic ${authBase64}`,
      },
    });

    const result = response.data;
    const message = result?.values?.message || {};

    // ✅ Support 2 tipe response
    const trxRef = message?.responseData?.orderId || message?.virtualAccountData?.trxId || null;
    const redirectUrl = message?.responseData?.endpointUrl || message?.virtualAccountData?.endpointUrl || null;

    if (!trxRef) {
      console.error("❌ Invalid MPStore response format:", JSON.stringify(result, null, 2));
      return res.status(500).json({ error: "Failed to extract transaction reference." });
    }

    await UserTransaction.create({
      userId: user.id,
      type: "TOPUP",
      amount: parsedAmount,
      status: "PENDING",
      transactionId: trxRef,
      description: "Top-Up via OttoPay"
    });

    return res.status(200).json({
      message: "Top-Up request created.",
      redirectUrl, // bisa null (VA) atau URL (secure page)

    });

  } catch (error) {
    const errData = error.response?.data || error.message;
    console.error("❌ Error in top-up:", errData);
    return res.status(500).json({ error: "Failed to process top-up." });
  }
};



const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const credentials = {
      id: process.env.MONEY_IN_MPSTORE_ID,
      username: process.env.MONEY_IN_MPSTORE_USERNAME,
      password: process.env.MONEY_IN_MPSTORE_PASSWORD,
      pin: process.env.MONEY_IN_MPSTORE_PIN,
    };
    const basicAuth = buildAuthorizationBase64(credentials);

    const transactions = await UserTransaction.findAll({
      where: {
        userId,
        type: 'TOPUP', // 🔍 hanya ambil transaksi topup
      },
      order: [["createdAt", "DESC"]],
      limit: 50,
    });


    const pendingTransactions = transactions.filter((tx) => tx.status === "PENDING");

    await Promise.all(
      pendingTransactions.map(async (tx) => {
        try {
          const timestamp = getTimestamp();
          const relativeUrl = `/api/serviceh2h/prod/dynamic-va/check-status?idtrx=${tx.transactionId}`;

          // 🔐 Generate Signature
          const sigResp = await axios.post(
            `${process.env.MONEY_IN_MPSTORE_HOST}/api/serviceh2h/dev/signature-calculator`,
            new URLSearchParams({
              method: "GET",
              relativeUrl,
              authorization: basicAuth,
              requestBody: "",
              timestamp,
            }).toString(),
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${basicAuth}`,
                "Timestamp": timestamp,
                "IdReseller": credentials.id,
              },
            }
          );

          const signature = sigResp?.data?.values?.message?.result;
          if (!signature) return;

          // 🌐 Check status transaksi ke OttoPay
          const statusRes = await axios.get(
            `${process.env.MONEY_IN_MPSTORE_HOST}${relativeUrl}`,
            {
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${basicAuth}`,
                "Signature": signature,
                "Timestamp": timestamp,
                "IdReseller": credentials.id,
              },
            }
          );

          const msg = statusRes.data?.message || {};
          tx.status = msg.transactionStatusDesc || "Unknown";
          tx.rawStatusCode = msg.transactionStatusCode || null;
          tx.responseDesc = msg.responseDesc || null;
          tx.updatedAt = new Date();

          // ✅ Jika status sudah "Sales" dan belum diproses
          if (tx.status === "Sales" && !tx.isApplied) {
            const user = await User.findByPk(tx.userId);
            if (!user) throw new Error("User tidak ditemukan");

            let transactionType = tx.type || "";
            let valueSBP = new Decimal(0);

            if (tx.description?.startsWith("Top-Up Manual:")) {
              // Manual Topup
              let exchanger = null;
              if (tx.exchangerId) {
                exchanger = await User.findOne({
                  where: { id: tx.exchangerId },
                  attributes: ["id", "username", "isCompanyExchanger", "exchangerLevel"],
                  paranoid: false,
                });
              }
              if (!exchanger) throw new Error("Exchanger tidak ditemukan");

              const rule = await getManualTopupRule(exchanger, user);
              if (!rule) throw new Error("Rule manual topup tidak ditemukan");

              await manualTopupProcessor(tx, user, rule); // ✅ Sudah mencakup bonus + histori
              transactionType = "manual_topup";
              valueSBP = new Decimal(rule.obtainedSBP || 0);

            } else {
              // Paket Topup
              const pkgTitle = tx.description?.replace("Beli Paket: ", "")?.trim();
              if (!pkgTitle) throw new Error("Paket title kosong");

              const pkg = await TopupPackage.findOne({ where: { title: pkgTitle } });
              if (!pkg) throw new Error(`Paket "${pkgTitle}" tidak ditemukan`);

              await packageTopupProcessor(tx, user, pkg); // ✅ Sudah mencakup bonus, histori, upgrade
              transactionType = `buy_package_${pkg.id}`;
              valueSBP = new Decimal(pkg.valueSBP || 0);
            }

            tx.isApplied = true;
            if (!tx.type) tx.type = transactionType;
          }

          await tx.save();
        } catch (err) {
          console.error(`❌ Gagal update status tx ${tx.transactionId}:`, err?.response?.data || err.message);
        }
      })
    );

    const updatedTxs = await UserTransaction.findAll({
      where: {
        userId,
        type: 'TOPUP',
      },
      order: [["createdAt", "DESC"]],
      limit: 50,
    });


    return res.status(200).json(updatedTxs);
  } catch (err) {
    console.error("❌ Error fetching user transactions:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};








const userTopUpManual = async (req, res) => {
  try {
    const { sbpAmount, bankCode, exchangerId } = req.body;
    const parsedSbp = new Decimal(sbpAmount);
    const parsedBankCode = parseInt(bankCode);

    if (!parsedSbp || parsedSbp <= 0 || isNaN(parsedBankCode)) {
      return res.status(400).json({ error: "Invalid S-BP amount or bank code." });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    let finalExchangerId = null;
    let sellerUser = null;

    if (exchangerId) {
      if (Number(exchangerId) === user.id) {
        return res.status(403).json({ error: "Tidak bisa membeli dari diri sendiri." });
      }

      const exchanger = await User.findByPk(exchangerId, {
        include: { model: UserBalance, as: "balance" },
      });

      const isValidExchanger =
        exchanger &&
        (
          exchanger.isCompanyExchanger === true ||
          ["mid", "senior", "executive"].includes(exchanger.exchangerLevel)
        );

      if (!isValidExchanger) {
        return res.status(400).json({ error: "Exchanger tidak valid." });
      }

      const isUserExchanger = (u) =>
        u.exchangerLevel === "mid" || u.exchangerLevel === "senior" || u.exchangerLevel === "executive";

      if (user.isCompanyExchanger && exchanger.isCompanyExchanger) {
        return res.status(403).json({ error: "Sesama company exchanger tidak boleh transaksi." });
      }

      if (isUserExchanger(user) && isUserExchanger(exchanger)) {
        return res.status(403).json({ error: "Sesama user exchanger tidak boleh transaksi." });
      }


      finalExchangerId = exchanger.id;
      sellerUser = exchanger;

      console.log(`[TOPUP-MANUAL] ${user.username} membeli ${parsedSbp} SBP dari ${exchanger.username}`);
    } else {
      const company = await User.findOne({ where: { isCompanyExchanger: true } });
      sellerUser = company;
      console.log(`[TOPUP-MANUAL] ${user.username} fallback topup ke company exchanger`);
    }

    // 🔍 Ambil konfigurasi harga berdasarkan relasi
    const rule = await getManualTopupRule(sellerUser, user);
    if (!rule || !rule.priceRupiah) {
      return res.status(400).json({ error: "Harga belum dikonfigurasi untuk hubungan ini." });
    }

    const amount = parsedSbp.mul(rule.priceRupiah).toNumber();
    const idtrx = `${Date.now()}-${user.id}`;
    const timestamp = getTimestamp();
    const relativeUrl = "/api/serviceh2h/prod/dynamic-va";
    const targetUrl = `${process.env.MONEY_IN_MPSTORE_HOST}${relativeUrl}`;

const payload = {
  amount,
  idtrx,
  email: user.email,
  firstName: user.username,
  lastName: user.username,
  phoneNumber: user.phoneNumber || "081234567890",
  bankCode: parsedBankCode,
  ...(parsedBankCode === 9 && { merchantName: "BCAVA", jsonRes: "0" }),
  ...(parsedBankCode === 7 && { merchantName: "QRIS", jsonRes: "0" }),
};


    const minifiedBody = minifyJSON(payload);
    const credentials = {
      id: process.env.MONEY_IN_MPSTORE_ID,
      username: process.env.MONEY_IN_MPSTORE_USERNAME,
      password: process.env.MONEY_IN_MPSTORE_PASSWORD,
      pin: process.env.MONEY_IN_MPSTORE_PIN,
    };

    const signature = await generateSignature({
      method: "POST",
      relativeUrl,
      requestBodyObj: payload,
      timestamp,
      credentials,
    });

    const authBase64 = buildAuthorizationBase64(credentials);
    const response = await axios.post(targetUrl, minifiedBody, {
      headers: {
        "Content-Type": "application/json",
        "Timestamp": timestamp,
        "Signature": signature,
        "Authorization": `Basic ${authBase64}`,
      },
    });

    const result = response.data;
    const trxRef = result?.values?.message?.responseData?.orderId || result?.values?.message?.virtualAccountData?.trxId || null;
    const redirectUrl = result?.values?.message?.responseData?.endpointUrl || result?.values?.message?.virtualAccountData?.endpointUrl || null;

    if (!trxRef) return res.status(500).json({ error: "Failed to extract transaction reference." });

    await UserTransaction.create({
      userId: user.id,
      type: "TOPUP",
      amount,
      status: "PENDING",
      transactionId: trxRef,
      description: `Top-Up Manual: ${parsedSbp} S-BP`,
      exchangerId: finalExchangerId,
    });

    return res.status(200).json({
      message: "Top-Up created",
      redirectUrl,
      idtrx,
    });
  } catch (err) {
    console.error("❌ Manual Top-Up Error:", err?.response?.data || err.message);
    return res.status(500).json({ error: "Failed to process manual top-up." });
  }
};





/**
 * 🔹 Paket Top-Up: Pilih dari TopupPackage
 */
const userTopUpPackage = async (req, res) => {
  try {
    const { packageId, bankCode } = req.body;
    const parsedPackageId = parseInt(packageId);
    const parsedBankCode = parseInt(bankCode);

    const pkg = await TopupPackage.findByPk(parsedPackageId);
    if (!pkg) return res.status(404).json({ error: "Package not found." });

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    // ✅ HARUS priceRupiah
    const amount = pkg.priceRupiah;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid or missing Rupiah price in package." });
    }

    const idtrx = `${Date.now()}-${user.id}`;
    const timestamp = getTimestamp();
    const relativeUrl = "/api/serviceh2h/prod/dynamic-va";
    const targetUrl = `${process.env.MONEY_IN_MPSTORE_HOST}${relativeUrl}`;

const payload = {
  amount,
  idtrx,
  email: user.email,
  firstName: user.username,
  lastName: user.username,
  phoneNumber: user.phoneNumber || "081234567890",
  bankCode: parsedBankCode,
  ...(parsedBankCode === 9 && { merchantName: "BCAVA", jsonRes: "0" }),
  ...(parsedBankCode === 7 && { merchantName: "QRIS", jsonRes: "0" }),
};



    const minifiedBody = minifyJSON(payload);
    const credentials = {
      id: process.env.MONEY_IN_MPSTORE_ID,
      username: process.env.MONEY_IN_MPSTORE_USERNAME,
      password: process.env.MONEY_IN_MPSTORE_PASSWORD,
      pin: process.env.MONEY_IN_MPSTORE_PIN,
    };

    const signature = await generateSignature({
      method: "POST",
      relativeUrl,
      requestBodyObj: payload,
      timestamp,
      credentials,
    });

    const authBase64 = buildAuthorizationBase64(credentials);
    const response = await axios.post(targetUrl, minifiedBody, {
      headers: {
        "Content-Type": "application/json",
        "Timestamp": timestamp,
        "Signature": signature,
        "Authorization": `Basic ${authBase64}`,
      },
    });

    const result = response.data;
    const trxRef = result?.values?.message?.responseData?.orderId || result?.values?.message?.virtualAccountData?.trxId || null;
    const redirectUrl = result?.values?.message?.responseData?.endpointUrl || result?.values?.message?.virtualAccountData?.endpointUrl || null;

    if (!trxRef) return res.status(500).json({ error: "Failed to extract transaction reference." });

    await UserTransaction.create({
      userId: user.id,
      type: "TOPUP",
      amount,
      status: "PENDING",
      transactionId: trxRef,
      description: `Beli Paket: ${pkg.title}`,
      packageId: pkg.id,
    });

    return res.status(200).json({
      message: "Top-Up created via package",
      redirectUrl,
      idtrx,
    });

  } catch (err) {
    console.error("❌ Package Top-Up Error:", err?.response?.data || err.message);
    return res.status(500).json({ error: "Failed to process package top-up." });
  }
};


const USER_LEVEL = {
  white: 1,
  green: 2,
  blue: 3,
  double_blue: 4,
};

const EXCHANGER_LEVEL = {
  none: 0,
  mid: 1,
  senior: 2,
  executive: 3,
};

const getTopupPackages = async (req, res) => {
  try {
    const allPackages = await TopupPackage.findAll({
      order: [["priceRupiah", "ASC"]],
    });

    // 🛡 Tanpa login → kirim semua paket (admin/public preview)
    if (!req.user || !req.user.id) {
      return res.status(200).json(allPackages);
    }

    // 🧍 Ambil user dan levelnya
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    const userLevelNow = USER_LEVEL[user.userLevel || "white"];
    const exchangerLevelNow = EXCHANGER_LEVEL[user.exchangerLevel || "none"];

    const filtered = allPackages.filter((pkg) => {
      const title = (pkg.title || "").toLowerCase();

      // ❌ Sembunyikan paket white
      if (title.includes("white")) return false;

      // ❌ Hide paket user level yang sudah dimiliki atau lebih rendah
      if (title.includes("paket green") && userLevelNow >= USER_LEVEL.green) return false;
      if (title.includes("paket blue") && !title.includes("double") && userLevelNow >= USER_LEVEL.blue) return false;
      if (title.includes("double blue") && userLevelNow >= USER_LEVEL.double_blue) return false;

      // ❌ Jangan tampilkan semua exchanger package kalau belum level blue
      const isExchangerPackage = title.includes("exchanger");
      if (isExchangerPackage && userLevelNow < USER_LEVEL.blue) return false;

      // ❌ Hide exchanger level yang sudah dimiliki atau lebih rendah
      if (title.includes("exchanger mid") && exchangerLevelNow >= EXCHANGER_LEVEL.mid) return false;
      if (title.includes("exchanger senior") && exchangerLevelNow >= EXCHANGER_LEVEL.senior) return false;
      if (title.includes("exchanger executive") && exchangerLevelNow >= EXCHANGER_LEVEL.executive) return false;

      return true;
    });

    return res.status(200).json(filtered);
  } catch (error) {
    console.error("❌ Error fetching top-up packages:", error);
    return res.status(500).json({ error: "Failed to fetch top-up packages." });
  }
};





const checkVAStatus = async (req, res) => {
  try {
    const { idtrx } = req.query;
    if (!idtrx) return res.status(400).json({ error: "Missing idtrx in query." });

    const timestamp = getTimestamp();
    const credentials = {
      id: process.env.MONEY_IN_MPSTORE_ID,
      username: process.env.MONEY_IN_MPSTORE_USERNAME,
      password: process.env.MONEY_IN_MPSTORE_PASSWORD,
      pin: process.env.MONEY_IN_MPSTORE_PIN,
    };
    const authBase64 = buildAuthorizationBase64(credentials);
    const relativeUrl = `/api/serviceh2h/prod/dynamic-va/check-status?idtrx=${idtrx}`;

    // 🔐 Hitung Signature
    const sigResp = await axios.post(
      `${process.env.MONEY_IN_MPSTORE_HOST}/api/serviceh2h/dev/signature-calculator`,
      new URLSearchParams({
        method: "GET",
        relativeUrl,
        authorization: authBase64,
        requestBody: "",
        timestamp,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${authBase64}`,
          Timestamp: timestamp,
          IdReseller: credentials.id,
        },
      }
    );

    const signature = sigResp?.data?.values?.message?.result;
    if (!signature) return res.status(500).json({ error: "Failed to generate signature." });

    // 📡 Request ke MPStore
    const statusRes = await axios.get(
      `${process.env.MONEY_IN_MPSTORE_HOST}${relativeUrl}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${authBase64}`,
          Signature: signature,
          Timestamp: timestamp,
          IdReseller: credentials.id,
        },
      }
    );

    // 🔄 Update status transaksi
    const msg = statusRes.data?.message || {};
    const tx = await UserTransaction.findOne({ where: { transactionId: idtrx } });
    if (!tx) return res.status(404).json({ error: "Transaction not found." });

    tx.status = msg.transactionStatusDesc || "Unknown";
    tx.rawStatusCode = msg.transactionStatusCode || null;
    tx.responseDesc = msg.responseDesc || null;
    tx.updatedAt = new Date();

    // ✅ Apply efek jika sudah Sales dan belum diproses
    if (tx.status === "Sales" && !tx.isApplied) {
      try {
        const user = await User.findByPk(tx.userId);
        if (!user) throw new Error("User tidak ditemukan");

        let transactionType = tx.type || "";
        let valueSBP = 0;

        if (tx.description?.startsWith("Top-Up Manual:")) {
          // 🔍 Ambil exchanger dengan paranoid false
          let exchanger = null;
          if (tx.exchangerId) {
            exchanger = await User.findOne({
              where: { id: tx.exchangerId },
              attributes: ["id", "username", "isCompanyExchanger", "exchangerLevel"],
              paranoid: false,
            });
          }

          if (!exchanger) throw new Error("Exchanger tidak ditemukan untuk manual topup");

          console.log("🧪 TX", tx.id, "cek rule: exchanger =", exchanger.username, "exchangerId =", tx.exchangerId);

          const rule = await getManualTopupRule(exchanger, user);
          if (!rule) throw new Error("Rule manual topup tidak ditemukan");

          await manualTopupProcessor(tx, user, rule);

          await recordSbpHistory({
            type: "sale",
            amount: rule.obtainedSBP || 0,
            user,
            note: `Top-Up Manual oleh ${user.username}`,
          });

          transactionType = "manual_topup";
          valueSBP = rule.obtainedSBP || 0;

        } else {
          const pkgTitle = tx.description?.replace("Beli Paket: ", "")?.trim();
          if (!pkgTitle) throw new Error("Paket title kosong");

          const pkg = await TopupPackage.findOne({ where: { title: pkgTitle } });
          if (!pkg) throw new Error(`Paket "${pkgTitle}" tidak ditemukan`);

          await packageTopupProcessor(tx, user, pkg);

          await recordSbpHistory({
            type: "sale",
            amount: pkg.valueSBP || 0,
            user,
            note: `Beli Paket oleh ${user.username}`,
          });

          transactionType = `buy_package_${pkg.id}`;
          valueSBP = pkg.valueSBP || 0;
        }

        // 🎁 Bonus referral dan upgrade level
        await applyReferralBonus(user, transactionType, {
          valueRupiah: new Decimal(tx.amount || 0),
          valueSBP: new Decimal(valueSBP || 0),
          valueRACE: new Decimal(0),
          valueTBP: new Decimal(0),
          transactionAmount: new Decimal(tx.amount || 0),
        });


        const pkg = transactionType.startsWith("buy_package_")
          ? await TopupPackage.findByPk(parseInt(transactionType.split("_").pop()))
          : null;

        await autoUpgradeUserLevel(user, pkg);

        // Tandai sudah diproses
        tx.isApplied = true;
        if (!tx.type) tx.type = transactionType;

      } catch (err) {
        console.error(`❌ Gagal apply tx ID ${tx.id}:`, err.message);
      }
    }

    await tx.save();
    return res.status(200).json(statusRes.data);
  } catch (error) {
    console.error("❌ Failed to check VA status:", error?.response?.data || error.message);
    return res.status(500).json({ error: "Failed to check VA status." });
  }
};




// ✅ GET /api/user-transactions/success-summary




const getSuccessfulTransactionsSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // 🔍 Ambil semua transaksi dengan status 'Sales' milik user
    const transactions = await UserTransaction.findAll({
      where: {
        userId,
        type: "TOPUP",
        status: "Sales",
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["email", "username", "userLevel", "exchangerLevel"],
        },
      ],
    });

    const user = transactions[0]?.user;

    // 🚫 Jika tidak ada transaksi ditemukan
    if (!user) {
      return res.status(200).json(null);
    }

    // 🧮 Inisialisasi perhitungan dengan Decimal
    const breakdown = {}; // key = deskripsi, value = { count, amount (Decimal) }
    let totalAmount = new Decimal(0);
    let totalCount = 0;

    // 🔄 Iterasi semua transaksi
    for (const tx of transactions) {
      const desc = tx.description || "Lainnya";
      const amount = new Decimal(tx.amount || 0);

      totalAmount = totalAmount.plus(amount);
      totalCount++;

      if (!breakdown[desc]) {
        breakdown[desc] = { count: 0, amount: new Decimal(0) };
      }

      breakdown[desc].count += 1;
      breakdown[desc].amount = breakdown[desc].amount.plus(amount);
    }

    // 🧾 Konversi Decimal ke number untuk response JSON
    const breakdownFormatted = {};
    for (const [key, val] of Object.entries(breakdown)) {
      breakdownFormatted[key] = {
        count: val.count,
        amount: val.amount.toNumber(), // atau .toFixed(2) jika ingin 2 desimal
      };
    }

    // ✅ Respon ringkasan transaksi
    return res.status(200).json({
      email: user.email,
      username: user.username,
      userLevel: user.userLevel,
      exchangerLevel: user.exchangerLevel,
      totalAmount: totalAmount.toNumber(),
      totalTransactions: totalCount,
      detailPerCategory: breakdownFormatted,
    });
  } catch (err) {
    console.error("❌ Failed to fetch summary:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


const generateQrisTopup = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    const idtrx = `${Date.now()}-${user.id}`;
    const timestamp = getTimestamp();
    const relativeUrl = "/api/serviceh2h/prod/dynamic-va";
    const targetUrl = `${process.env.MONEY_IN_MPSTORE_HOST}${relativeUrl}`;

    const payload = {
      amount,
      idtrx,
      email: user.email,
      firstName: user.username,
      lastName: user.username,
      phoneNumber: user.phoneNumber || "081234567890",
      bankCode: 7, // QRIS
    };

    const minifiedBody = minifyJSON(payload);
    const credentials = {
      id: process.env.MONEY_IN_MPSTORE_ID,
      username: process.env.MONEY_IN_MPSTORE_USERNAME,
      password: process.env.MONEY_IN_MPSTORE_PASSWORD,
      pin: process.env.MONEY_IN_MPSTORE_PIN,
    };

    const signature = await generateSignature({
      method: "POST",
      relativeUrl,
      requestBodyObj: payload,
      timestamp,
      credentials,
    });

    const authBase64 = buildAuthorizationBase64(credentials);
    const response = await axios.post(targetUrl, minifiedBody, {
      headers: {
        "Content-Type": "application/json",
        "Timestamp": timestamp,
        "Signature": signature,
        "Authorization": `Basic ${authBase64}`,
      },
    });

    const result = response.data?.values?.message?.responseData;

    if (!result || !result.qrContent || !result.endpointUrl) {
      return res.status(500).json({ error: "Invalid response from MPStore" });
    }

    await UserTransaction.create({
      userId: user.id,
      type: "TOPUP",
      amount,
      status: "PENDING",
      transactionId: result.orderId,
      description: `QRIS Top-Up: Rp${amount}`,
    });

    return res.status(200).json({
      qrData: result.qrContent, // base64
      orderId: result.orderId,
      expiredAt: result.qrExpiredTime,
    });
  } catch (err) {
    console.error("❌ Failed to generate QRIS:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to generate QRIS." });
  }
};



module.exports = {
  userTopUp,
  getUserTransactions,
  userTopUpManual,
  userTopUpPackage,
  getTopupPackages,
  checkVAStatus,
  getSuccessfulTransactionsSummary,
  generateQrisTopup,
};
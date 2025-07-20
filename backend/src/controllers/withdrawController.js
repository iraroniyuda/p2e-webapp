const Decimal = require("decimal.js");
const User = require("../models/User");
const UserBalance = require("../models/UserBalance");
const UserTransaction = require("../models/UserTransaction");
const WithdrawConfig = require("../models/WithdrawConfig");

const {
  generateSignature,
  buildAuthorizationBase64,
  minifyJSON,
  getTimestamp,
} = require("../utils/mpstoreUtils");

const axios = require("axios");

/**
 * 🔐 Endpoint untuk inquiry WD (type 5) ke MPStore
 * hanya cek validitas rekening + estimasi biaya
 */
const userWithdrawInquiry = async (req, res) => {
  try {
    const { bankCode, nominal } = req.body;

    // Validasi awal bank code
    if (!bankCode || typeof bankCode !== "string" || bankCode.length < 4) {
      return res.status(400).json({ error: "Bank code tidak valid." });
    }

    // Ambil minimal withdraw dari config admin
    const config = await WithdrawConfig.findOne({
      where: { status: "Active" },
      order: [["updatedAt", "DESC"]],
    });
    const minWithdraw = config ? Number(config.minWithdrawAmount) : 10000; // fallback ke 10rb

    // Validasi nominal
    if (!nominal || Number(nominal) < minWithdraw) {
      return res.status(400).json({
        error: `Nominal minimal Rp${minWithdraw.toLocaleString("id-ID")}.`,
        minWithdraw,
      });
    }

    // Validasi user dan rekening
    const user = await User.findByPk(req.user.id);
    if (!user || !user.bankAccountNumber) {
      return res.status(400).json({ error: "User tidak ditemukan atau belum mengatur rekening." });
    }

    const idtrx = `${Date.now()}-${user.id}`;
    const payload = {
      productCode: bankCode,
      dest: `${user.bankAccountNumber}@${new Decimal(nominal).toFixed(0)}`,
      idtrx,
      type: "5", // Inquiry
    };

    const timestamp = getTimestamp();
    const credentials = {
      id: process.env.MONEY_OUT_MPSTORE_ID,
      username: process.env.MONEY_OUT_MPSTORE_USERNAME,
      password: process.env.MONEY_OUT_MPSTORE_PASSWORD,
      pin: process.env.MONEY_OUT_MPSTORE_PIN,
    };

    const signature = await generateSignature({
      method: "POST",
      relativeUrl: "/api/serviceh2h/prod/transactions",
      requestBodyObj: payload,
      timestamp,
      credentials,
    });

    const authBase64 = buildAuthorizationBase64(credentials);

    const response = await axios.post(
      `${process.env.MONEY_OUT_MPSTORE_HOST}/api/serviceh2h/prod/transactions`,
      minifyJSON(payload),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${authBase64}`,
          Signature: signature,
          Timestamp: timestamp,
        },
      }
    );

    const values = response?.data?.values;
    if (!values?.success) {
      return res.status(400).json({ error: "Gagal proses ke MPStore.", response: values });
    }

    // ✅ Simpan inquiry ke DB dengan field `method`
    await UserTransaction.create({
      userId: user.id,
      transactionId: idtrx,
      amount: nominal,
      type: "WITHDRAWAL_INQUIRY",
      method: bankCode,
      status: "PENDING",
      note: "Inquiry withdraw berhasil. Menunggu eksekusi.",
      responseDesc: values.message || null,
    });

    return res.json({ message: "Inquiry berhasil.", idtrx, response: values });

  } catch (err) {
    console.error("❌ Error withdraw-inquiry:", err?.response?.data || err.message);
    return res.status(500).json({ error: "Gagal melakukan inquiry withdraw." });
  }
};



const userWithdrawExecute = async (req, res) => {
  try {
    const { idtrx } = req.body;
    if (!idtrx) {
      return res.status(400).json({ error: "ID transaksi inquiry tidak ditemukan." });
    }

    const userId = req.user.id;
    const user = await User.findByPk(userId);
    const balance = await UserBalance.findOne({ where: { userId } });

    console.log("🔍 Eksekusi withdraw dimulai");
    console.log("🧾 User ID:", userId);
    console.log("🧾 ID Transaksi (Inquiry):", idtrx);

    const inquiry = await UserTransaction.findOne({
      where: {
        userId,
        transactionId: idtrx,
        type: "WITHDRAWAL_INQUIRY",
        status: "PENDING",
      },
    });

    if (!inquiry) {
      return res.status(400).json({ error: "Inquiry tidak ditemukan atau sudah dieksekusi." });
    }

    if (!inquiry.method) {
      return res.status(400).json({ error: "Inquiry tidak memiliki bankCode (method)." });
    }

    if (!balance || new Decimal(balance.rupiah).lt(inquiry.amount)) {
      return res.status(400).json({ error: "Saldo rupiah tidak mencukupi." });
    }

    const execIdtrx = `${idtrx}-exec`; // Gunakan ID berbeda
    const amountInt = new Decimal(inquiry.amount).toFixed(0);
    const payload = {
      productCode: inquiry.method,
      dest: `${user.bankAccountNumber}@${amountInt}`,
      idtrx: execIdtrx,
      type: "6", // Eksekusi
    };

    const timestamp = getTimestamp();
    const credentials = {
      id: process.env.MONEY_OUT_MPSTORE_ID,
      username: process.env.MONEY_OUT_MPSTORE_USERNAME,
      password: process.env.MONEY_OUT_MPSTORE_PASSWORD,
      pin: process.env.MONEY_OUT_MPSTORE_PIN,
    };

    const signature = await generateSignature({
      method: "POST",
      relativeUrl: "/api/serviceh2h/prod/transactions",
      requestBodyObj: payload,
      timestamp,
      credentials,
    });

    const authBase64 = buildAuthorizationBase64(credentials);

    const response = await axios.post(
      `${process.env.MONEY_OUT_MPSTORE_HOST}/api/serviceh2h/prod/transactions`,
      minifyJSON(payload),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${authBase64}`,
          Signature: signature,
          Timestamp: timestamp,
        },
      }
    );

    const values = response?.data?.values;
    console.log("📦 MPStore Response:", values);

    if (!values?.success) {
      return res.status(400).json({
        error: "Gagal proses ke MPStore.",
        response: values,
      });
    }

    // ❌ Deteksi jika message masih template inquiry
    if (values?.message?.includes("menarik Dana sebesar")) {
      return res.status(400).json({
        error: "Respon MPStore menunjukkan ini masih inquiry, bukan eksekusi.",
        response: values,
      });
    }

    // 💸 Potong saldo user
    balance.rupiah = new Decimal(balance.rupiah).minus(inquiry.amount).toString();
    await balance.save();

    // 📝 Catat transaksi withdraw final
    try {
      await UserTransaction.create({
        userId,
        transactionId: execIdtrx,
        amount: inquiry.amount,
        type: "WITHDRAWAL",
        method: inquiry.method,
        status: values?.message?.includes("BERHASIL") ? "SUCCESS" : "PENDING",
        note: `Withdraw final: ${values?.message || "-"}`,
        responseDesc: values?.message || null,
      });

      inquiry.status = "EXECUTED";
      await inquiry.save();

      return res.json({
        message: "Withdraw berhasil diproses.",
        idtrx: execIdtrx,
        response: {
          ...values,
          source: "EXECUTE",
        },
      });

    } catch (saveErr) {
      // 🔁 Rollback jika gagal menyimpan transaksi
      balance.rupiah = new Decimal(balance.rupiah).plus(inquiry.amount).toString();
      await balance.save();

      console.error("❌ Gagal simpan transaksi withdraw:", saveErr);
      return res.status(500).json({
        error: "Gagal mencatat transaksi withdraw. Saldo dikembalikan.",
      });
    }

  } catch (err) {
    console.error("❌ Error withdraw-execute:", err?.response?.data || err.message);
    return res.status(500).json({ error: "Gagal eksekusi withdraw." });
  }
};











const checkWithdrawTransaction = async (req, res) => {
  try {
    const { productCode, dest, idtrx, type } = req.query;

    if (!productCode || !dest || !idtrx || !type) {
      return res.status(400).json({ error: "Missing required query parameters." });
    }

    const timestamp = getTimestamp();

    const credentials = {
      id: process.env.MONEY_OUT_MPSTORE_ID,
      username: process.env.MONEY_OUT_MPSTORE_USERNAME,
      password: process.env.MONEY_OUT_MPSTORE_PASSWORD,
      pin: process.env.MONEY_OUT_MPSTORE_PIN,
    };

    const basicAuth = buildAuthorizationBase64(credentials);

    const relativeUrl = `/api/serviceh2h/prod/get-transactions?productCode=${productCode}&dest=${dest}&idtrx=${idtrx}&type=${type}`;

    const signatureResponse = await axios.post(
      `${process.env.MONEY_OUT_MPSTORE_HOST}/api/serviceh2h/dev/signature-calculator`,
      new URLSearchParams({
        method: "GET",
        relativeUrl,
        authorization: basicAuth,
        requestBody: "",
        timestamp
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${basicAuth}`,
          Timestamp: timestamp,
          IdReseller: credentials.id,
        },
      }
    );

    const signature = signatureResponse?.data?.values?.message?.result;
    if (!signature) {
      return res.status(500).json({ error: "Failed to generate signature." });
    }

    const fullUrl = `${process.env.MONEY_OUT_MPSTORE_HOST}${relativeUrl}`;
    const trxResponse = await axios.get(fullUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
        Signature: signature,
        Timestamp: timestamp,
      },
    });

    return res.status(200).json(trxResponse.data);
  } catch (err) {
    console.error("❌ Failed to check withdraw transaction:", err?.response?.data || err.message);
    return res.status(500).json({ error: "Failed to check transaction status." });
  }
};

const checkWithdrawStatus = async (req, res) => {
  try {
    const { idtrx } = req.query;

    if (!idtrx) return res.status(400).json({ error: "Missing idtrx." });

    const timestamp = getTimestamp();
    const relativeUrl = `/api/serviceh2h/prod/dynamic-va/check-status?idtrx=${idtrx}`;

    const credentials = {
      username: process.env.MONEY_IN_MPSTORE_USERNAME,
      password: process.env.MONEY_IN_MPSTORE_PASSWORD,
    };

    const basicAuth = buildAuthorizationBase64(credentials);
    const signature = generateSignature({
      method: "GET",
      relativeUrl,
      authorization: basicAuth,
      requestBody: "",
      timestamp,
    });

    const fullUrl = `${process.env.MONEY_IN_MPSTORE_HOST}${relativeUrl}`;

    const response = await axios.get(fullUrl, {
      headers: {
        "Content-Type": "application/json",
        Timestamp: timestamp,
        Signature: signature,
        Authorization: `Basic ${basicAuth}`,
      },
    });

    return res.status(200).json(response.data);
  } catch (err) {
    console.error("❌ Failed to check status:", err?.response?.data || err.message);
    return res.status(500).json({ error: "Failed to check withdraw status." });
  }
};

const getWithdrawHistory = async (req, res) => {
  try {
    const list = await UserTransaction.findAll({
      where: {
        userId: req.user.id,
        type: "WITHDRAWAL",
      },
      order: [["createdAt", "DESC"]],
      limit: 50,
    });
    res.json({ history: list });
  } catch (err) {
    console.error("❌ Gagal ambil riwayat withdraw:", err);
    res.status(500).json({ error: "Gagal ambil riwayat withdraw." });
  }
};


module.exports = {

  userWithdrawInquiry,
  userWithdrawExecute,
  checkWithdrawTransaction,
  checkWithdrawStatus,
  getWithdrawHistory
};
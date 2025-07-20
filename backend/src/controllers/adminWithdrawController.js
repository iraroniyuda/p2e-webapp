const Decimal = require("decimal.js");
const UserTransaction = require("../models/UserTransaction");
const {
  generateSignature,
  buildAuthorizationBase64,
  minifyJSON,
  getTimestamp,
} = require("../utils/mpstoreUtils");
const axios = require("axios");

// =========================
// ADMIN WITHDRAW CONTROLLER
// =========================

// INQUIRY ADMIN (WAJIB sebelum eksekusi)
const adminWithdrawInquiry = async (req, res) => {
  try {
    const { bankCode, nominal, bankAccountNumber } = req.body;
    if (!bankCode || !bankAccountNumber || !nominal) {
      return res.status(400).json({ error: "Data tidak lengkap." });
    }

    const idtrx = `${Date.now()}-${req.user.id}`;
    const payload = {
      productCode: bankCode,
      dest: `${bankAccountNumber}@${new Decimal(nominal).toFixed(0)}`,
      idtrx,
      type: "5",
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

    await UserTransaction.create({
      userId: req.user.id,
      transactionId: idtrx,
      amount: nominal,
      type: "WITHDRAWAL_ADMIN_INQUIRY",
      method: bankCode,
      status: "PENDING",
      // note: dihapus
      responseDesc: values.message || null,
    });

    return res.json({ message: "Inquiry berhasil.", idtrx, response: values });
  } catch (err) {
    console.error("❌ Error admin withdraw-inquiry:", err?.response?.data || err.message);
    return res.status(500).json({ error: "Gagal melakukan inquiry withdraw (admin)." });
  }
};

// EKSEKUSI ADMIN (Wajib pakai idtrx inquiry & rekening dari frontend)
const adminWithdrawExecute = async (req, res) => {
  try {
    const { idtrx, bankAccountNumber } = req.body;
    if (!idtrx || !bankAccountNumber) {
      return res.status(400).json({ error: "ID transaksi inquiry atau rekening belum diisi." });
    }

    const inquiry = await UserTransaction.findOne({
      where: {
        userId: req.user.id,
        transactionId: idtrx,
        type: "WITHDRAWAL_ADMIN_INQUIRY",
        status: "PENDING",
      }
    });

    if (!inquiry) {
      return res.status(400).json({ error: "Inquiry admin tidak ditemukan atau sudah dieksekusi." });
    }

    const execIdtrx = `${idtrx}-exec`;
    const amountInt = new Decimal(inquiry.amount).toFixed(0);
    const payload = {
      productCode: inquiry.method,
      dest: `${bankAccountNumber}@${amountInt}`,
      idtrx: execIdtrx,
      type: "6",
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
      return res.status(400).json({
        error: "Gagal proses ke MPStore.",
        response: values,
      });
    }

    // Catat transaksi final (tanpa note)
    await UserTransaction.create({
      userId: req.user.id,
      transactionId: execIdtrx,
      amount: inquiry.amount,
      type: "WITHDRAWAL_ADMIN",
      method: inquiry.method,
      status: values?.message?.includes("BERHASIL") ? "SUCCESS" : "PENDING",
      // note: dihapus
      responseDesc: values?.message || null,
    });

    inquiry.status = "EXECUTED";
    await inquiry.save();

    return res.json({
      message: "Withdraw admin berhasil diproses.",
      execIdtrx,
      response: {
        ...values,
        source: "ADMIN_EXECUTE",
      },
    });
  } catch (err) {
    console.error("❌ Error admin withdraw-execute:", err?.response?.data || err.message);
    return res.status(500).json({ error: "Gagal eksekusi withdraw (admin)." });
  }
};

module.exports = {
  adminWithdrawInquiry,
  adminWithdrawExecute,
};

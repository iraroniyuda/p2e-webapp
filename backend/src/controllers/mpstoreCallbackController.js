const User = require('../models/User');
const UserTransaction = require('../models/UserTransaction');

const handleMPStoreCallback = async (req, res) => {
  try {
    const {
      idtrx,
      status,
      amount,
      paidAt,
      statusDescription
    } = req.body;

    console.log("🔔 Callback Received:", req.body);

    const transaction = await UserTransaction.findOne({
      where: { transactionId: idtrx }
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Jangan proses ulang
    if (["COMPLETED", "FAILED"].includes(transaction.status)) {
      return res.status(200).json({ message: "Callback already processed" });
    }

    const user = await User.findByPk(transaction.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Validasi jumlah (opsional tapi aman)
    if (parseFloat(amount) !== parseFloat(transaction.amount)) {
      console.warn(`⚠️ Nominal mismatch: ${amount} vs expected ${transaction.amount}`);
    }

    if (status === "00") {
      transaction.status = "COMPLETED";
      user.balance += transaction.amount;
      await user.save();
    } else {
      transaction.status = "FAILED";
    }

    // Simpan info tambahan (opsional)
    transaction.paidAt = paidAt || null;
    transaction.notes = statusDescription || null;
    await transaction.save();

    return res.status(200).json({ message: "Callback processed successfully" });

  } catch (err) {
    console.error("❌ Callback error:", err);
    return res.status(500).json({ error: "Callback processing failed" });
  }
};


module.exports = {
  handleMPStoreCallback
};

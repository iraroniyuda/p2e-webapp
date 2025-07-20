// src/controllers/paymentController.js
exports.paymentCallback = async (req, res) => {
  const { transactionId, status, amount, accountNumber, message } = req.body;

  try {
    console.log("Callback Received:", req.body);

    // Validasi Transaction ID
    if (!transactionId) {
      return res.status(400).json({ error: "Invalid callback data." });
    }

    // Temukan transaksi withdraw berdasarkan Transaction ID
    const withdraw = await Withdraw.findOne({ where: { transactionId } });

    if (!withdraw) {
      return res.status(404).json({ error: "Withdraw not found." });
    }

    // Update status transaksi berdasarkan status dari MPStore
    if (status === "success") {
      withdraw.status = "completed";
    } else if (status === "failed") {
      withdraw.status = "failed";
      
      // Jika gagal, refund saldo user
      const user = await User.findByPk(withdraw.userId);
      user.balance += parseFloat(amount);
      await user.save();
    }

    await withdraw.save();
    return res.status(200).json({ message: "Callback processed successfully." });
  } catch (error) {
    console.error("Callback Error:", error);
    return res.status(500).json({ error: "Error processing callback." });
  }
};

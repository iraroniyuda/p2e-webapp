const TbpStakingHistory = require("../models/TbpStakingHistory");

/**
 * Menyimpan history staking (stake / unstake / claim)
 * Endpoint: POST /staking/history
 */
const createTbpStakingHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { action, amount, txHash } = req.body;

    // Validasi
    if (!["stake", "unstake", "claim"].includes(action)) {
      return res.status(400).json({ error: "Aksi tidak valid" });
    }

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: "Jumlah tidak valid" });
    }

    // Simpan ke database
    await TbpStakingHistory.create({
      userId,
      action,
      amount,
      txHash,
    });

    return res.json({ success: true, message: "History staking disimpan" });
  } catch (err) {
    console.error("❌ Gagal simpan history staking:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createTbpStakingHistory,
};

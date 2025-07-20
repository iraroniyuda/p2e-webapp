const WithdrawConfig = require("../models/WithdrawConfig");

/**
 * Get all withdraw configs (bisa di-limit 1 di frontend jika hanya pakai satu config)
 */
exports.getAllWithdrawConfigs = async (req, res) => {
  try {
    const configs = await WithdrawConfig.findAll({ order: [["updatedAt", "DESC"]] });
    res.json({ configs });
  } catch (err) {
    console.error("❌ Gagal ambil list config WD:", err);
    res.status(500).json({ error: "Gagal ambil list config WD." });
  }
};

/**
 * Create new withdraw config
 */
exports.createWithdrawConfig = async (req, res) => {
  try {
    const { minWithdrawAmount, currency = "IDR", status = "Active" } = req.body;
    if (!minWithdrawAmount || isNaN(minWithdrawAmount) || Number(minWithdrawAmount) < 0) {
      return res.status(400).json({ error: "Minimal withdraw tidak valid." });
    }
    const config = await WithdrawConfig.create({ minWithdrawAmount, currency, status });
    res.json({ success: true, config });
  } catch (err) {
    console.error("❌ Gagal create config WD:", err);
    res.status(500).json({ error: "Gagal create config WD." });
  }
};

/**
 * Update withdraw config by id
 */
exports.updateWithdrawConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const { minWithdrawAmount, currency, status } = req.body;
    const config = await WithdrawConfig.findByPk(id);
    if (!config) return res.status(404).json({ error: "Config tidak ditemukan." });

    if (minWithdrawAmount !== undefined) config.minWithdrawAmount = minWithdrawAmount;
    if (currency !== undefined) config.currency = currency;
    if (status !== undefined) config.status = status;

    await config.save();
    res.json({ success: true, config });
  } catch (err) {
    console.error("❌ Gagal update config WD:", err);
    res.status(500).json({ error: "Gagal update config WD." });
  }
};

/**
 * Delete withdraw config by id
 */
exports.deleteWithdrawConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const config = await WithdrawConfig.findByPk(id);
    if (!config) return res.status(404).json({ error: "Config tidak ditemukan." });

    await config.destroy();
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Gagal hapus config WD:", err);
    res.status(500).json({ error: "Gagal hapus config WD." });
  }
};

// 📁 controllers/upgradePriceConfigController.js
const UpgradePriceConfig = require("../models/UpgradePriceConfig");

const getAllConfigs = async (req, res) => {
  try {
    const configs = await UpgradePriceConfig.findAll();
    res.json(configs);
  } catch (err) {
    res.status(500).json({ error: "❌ Gagal mengambil konfigurasi." });
  }
};

const setPriceConfig = async (req, res) => {
  try {
    const { partType, level, price } = req.body;
    if (!partType || isNaN(level) || isNaN(price))
      return res.status(400).json({ error: "❌ Input tidak valid." });

    await UpgradePriceConfig.upsert({ partType, level, price });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "❌ Gagal menyimpan konfigurasi." });
  }
};

module.exports = { getAllConfigs, setPriceConfig };
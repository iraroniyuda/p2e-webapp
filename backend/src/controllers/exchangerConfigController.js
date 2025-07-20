// src/controllers/exchangerConfigController.js
const ExchangerConfig = require("../models/ExchangerConfig");

const getExchangerConfig = async (req, res) => {
  try {
    const config = await ExchangerConfig.findOne();
    if (!config) return res.json(null);
    res.json(config);
  } catch (err) {
    console.error("❌ getExchangerConfig error:", err);
    res.status(500).json({ error: "Gagal memuat konfigurasi exchanger." });
  }
};

const updateExchangerConfig = async (req, res) => {
  try {
    const { feePercent, bonusPercent, bonusAsset } = req.body;
    let config = await ExchangerConfig.findOne();

    if (!config) {
      config = await ExchangerConfig.create({ feePercent, bonusPercent, bonusAsset });
    } else {
      config.feePercent = feePercent;
      config.bonusPercent = bonusPercent;
      config.bonusAsset = bonusAsset;
      await config.save();
    }

    res.json(config);
  } catch (err) {
    console.error("❌ updateExchangerConfig error:", err);
    res.status(500).json({ error: "Gagal menyimpan konfigurasi." });
  }
};

module.exports = {
  getExchangerConfig,
  updateExchangerConfig,
};

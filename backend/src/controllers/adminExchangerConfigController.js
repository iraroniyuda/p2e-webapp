const ExchangerConfig = require("../models/ExchangerConfig");

/**
 * GET /admin/exchanger-config
 */
const getExchangerConfig = async (req, res) => {
  try {
    const configs = await ExchangerConfig.findAll({
      order: [["level", "ASC"]],
    });
    res.json(configs);
  } catch (err) {
    console.error("❌ getExchangerConfig error:", err);
    res.status(500).json({ error: "Gagal mengambil konfigurasi exchanger." });
  }
};

/**
 * POST /admin/exchanger-config/update
 */
const updateExchangerConfig = async (req, res) => {
  try {
    const {
      level,
      bonusAsset,
      bonusPercent,
      bonusDescription,
    } = req.body;

    if (!level || !["mid", "senior", "executive"].includes(level)) {
      return res.status(400).json({ error: "Level exchanger tidak valid." });
    }

    let config = await ExchangerConfig.findOne({ where: { level } });

    if (!config) {
      config = await ExchangerConfig.create({
        level,
        bonusAsset,
        bonusPercent,
        bonusDescription,
      });
    } else {
      config.bonusAsset = bonusAsset;
      config.bonusPercent = bonusPercent;
      config.bonusDescription = bonusDescription;
      await config.save();
    }

    return res.json({
      success: true,
      message: `Konfigurasi exchanger level ${level} berhasil diperbarui.`,
    });
  } catch (err) {
    console.error("❌ updateExchangerConfig error:", err);
    res.status(500).json({ error: "Gagal menyimpan konfigurasi exchanger." });
  }
};

module.exports = {
  getExchangerConfig,
  updateExchangerConfig,
};

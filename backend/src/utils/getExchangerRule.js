const ExchangerConfig = require("../models/ExchangerConfig");

/**
 * Ambil aturan exchanger berdasarkan level.
 * @param {string} level - Level exchanger (mid | senior | executive)
 * @returns {Promise<ExchangerConfig>}
 */
const getExchangerRule = async (level) => {
  if (!level || !["mid", "senior", "executive"].includes(level)) {
    throw new Error("Level exchanger tidak valid.");
  }

  const rule = await ExchangerConfig.findOne({ where: { level } });

  if (!rule) {
    throw new Error(`Konfigurasi untuk level "${level}" tidak ditemukan.`);
  }

  return rule;
};

module.exports = getExchangerRule;

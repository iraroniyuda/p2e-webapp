const RaceReferralBonusConfig = require("../models/RaceReferralBonusConfig");
const Decimal = require("decimal.js");

exports.getAllReferralBonusConfigs = async (req, res) => {
  try {
    const data = await RaceReferralBonusConfig.findAll({ order: [["userLevel", "ASC"]] });
    res.json({ success: true, configs: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Gagal mengambil konfigurasi referral bonus." });
  }
};

exports.updateReferralBonusConfig = async (req, res) => {
  const { id } = req.params;
  const {
    directBonusPercent,
    gen1BonusPercent,
    gen2BonusPercent,
    gen3BonusPercent,
    gen4BonusPercent,
    gen5BonusPercent,
    gen6BonusPercent,
  } = req.body;

  const updates = {};
  if (directBonusPercent !== undefined)
    updates.directBonusPercent = new Decimal(directBonusPercent).toFixed(2);
  if (gen1BonusPercent !== undefined)
    updates.gen1BonusPercent = new Decimal(gen1BonusPercent).toFixed(2);
  if (gen2BonusPercent !== undefined)
    updates.gen2BonusPercent = new Decimal(gen2BonusPercent).toFixed(2);
  if (gen3BonusPercent !== undefined)
    updates.gen3BonusPercent = new Decimal(gen3BonusPercent).toFixed(2);
  if (gen4BonusPercent !== undefined)
    updates.gen4BonusPercent = new Decimal(gen4BonusPercent).toFixed(2);
  if (gen5BonusPercent !== undefined)
    updates.gen5BonusPercent = new Decimal(gen5BonusPercent).toFixed(2);
  if (gen6BonusPercent !== undefined)
    updates.gen6BonusPercent = new Decimal(gen6BonusPercent).toFixed(2);

  try {
    await RaceReferralBonusConfig.update(updates, { where: { id } });
    res.json({ success: true, message: "Referral bonus berhasil diperbarui." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Gagal update data." });
  }
};

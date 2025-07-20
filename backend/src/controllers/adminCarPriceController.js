const GameAssetStoreRace = require('../models/GameAssetStoreRace');
const Decimal = require('decimal.js');
const UpgradeFlatPriceConfig = require('../models/UpgradeFlatPriceConfig');

exports.getAllAdminAssets = async (req, res) => {
  try {
    const assets = await GameAssetStoreRace.findAll({ order: [['id', 'ASC']] });
    res.json({ success: true, assets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Gagal mengambil aset." });
  }
};

exports.updateAssetPrice = async (req, res) => {
  const { id } = req.params;
  const { newPrice, newValueSBP } = req.body;

  const updates = {};
  if (newPrice !== undefined)
    updates.price = new Decimal(newPrice).toFixed(18);
  if (newValueSBP !== undefined)
    updates.valueSBP = new Decimal(newValueSBP).toFixed(18);

  try {
    await GameAssetStoreRace.update(updates, { where: { id } });
    res.json({ success: true, message: "Data berhasil diperbarui." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Gagal memperbarui data." });
  }
};

exports.getAllUpgradeFlatPriceConfigs = async (req, res) => {
  try {
    const configs = await UpgradeFlatPriceConfig.findAll({ order: [["partType", "ASC"]] });
    res.json({ success: true, configs });
  } catch (err) {
    console.error("❌ Gagal ambil upgrade config:", err);
    res.status(500).json({ success: false, error: "Gagal mengambil konfigurasi upgrade." });
  }
};


exports.updateUpgradeFlatPriceConfig = async (req, res) => {
  const { partType } = req.params;
  const { newPrice, newValueSBP, newDurability } = req.body;

  const updates = {};
  if (newPrice !== undefined)
    updates.price = new Decimal(newPrice).toFixed(18);
  if (newValueSBP !== undefined)
    updates.valueSBP = new Decimal(newValueSBP).toFixed(18);
  if (newDurability !== undefined)
    updates.defaultDurability = parseInt(newDurability);

  try {
    const [affectedRows] = await UpgradeFlatPriceConfig.update(updates, {
      where: { partType },
    });

    if (affectedRows === 0) {
      return res.status(404).json({ success: false, error: "Part type tidak ditemukan." });
    }

    res.json({ success: true, message: "Konfigurasi berhasil diperbarui." });
  } catch (err) {
    console.error("❌ Gagal update config:", err);
    res.status(500).json({ success: false, error: "Gagal memperbarui konfigurasi." });
  }
};

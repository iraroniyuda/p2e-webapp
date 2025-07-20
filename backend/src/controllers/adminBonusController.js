const BonusConfig = require('../models/BonusConfig');

// 🔍 Helper: validasi userLevel yang sah
const isValidUserLevel = (level) => {
  const userLevels = ["white", "green", "blue", "double_blue"];
  const exchangerLevels = ["mid", "senior", "executive"];

  if (userLevels.includes(level)) return true;
  if (level.startsWith("exchanger:")) {
    const parts = level.split(":");
    return parts.length === 2 && exchangerLevels.includes(parts[1]);
  }
  return false;
};

// 🟩 Ambil semua bonus config
exports.getAllBonusConfigs = async (req, res) => {
  try {
    const configs = await BonusConfig.findAll();
    res.json(configs);
  } catch (err) {
    console.error("❌ Gagal ambil BonusConfig:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ➕ Tambah config baru
exports.createBonusConfig = async (req, res) => {
  try {
    const allowedFields = [
      "userLevel",
      "transactionType",
      "isOneTime",
      "bonusAsset",
      "method",
      "value",
      "basedOn",
      "basedOnGenerational",
      "generation",
      "referralBonuses",
      "exclusiveGroup",
      "exclusiveGroupScope",
    ];

    const payload = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        payload[key] = req.body[key];
      }
    }

    // 🔒 Validasi wajib
    if (!payload.userLevel || !isValidUserLevel(payload.userLevel)) {
      return res.status(400).json({ error: "userLevel tidak valid" });
    }

    if (!payload.transactionType) {
      return res.status(400).json({ error: "transactionType wajib" });
    }

    if (payload.method === "flat" && !payload.bonusAsset) {
      return res.status(400).json({ error: "bonusAsset wajib untuk metode flat" });
    }

    const created = await BonusConfig.create(payload);
    res.status(201).json(created);
  } catch (err) {
    console.error("❌ Gagal buat BonusConfig:", err);
    res.status(400).json({ error: "Gagal membuat bonus config" });
  }
};

// ✏️ Update config
exports.updateBonusConfig = async (req, res) => {
  try {
    const config = await BonusConfig.findByPk(req.params.id);
    if (!config) {
      return res.status(404).json({ error: "Data tidak ditemukan" });
    }

    const allowedFields = [
      "userLevel",
      "transactionType",
      "isOneTime",
      "bonusAsset",
      "method",
      "value",
      "basedOn",
      "basedOnGenerational",
      "generation",
      "referralBonuses",
      "exclusiveGroup",
      "exclusiveGroupScope",
    ];

    const payload = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        payload[key] = req.body[key];
      }
    }

    // 🔒 Validasi wajib saat update
    if (payload.userLevel && !isValidUserLevel(payload.userLevel)) {
      return res.status(400).json({ error: "userLevel tidak valid" });
    }

    if (payload.method === "flat" && !payload.bonusAsset) {
      return res.status(400).json({ error: "bonusAsset wajib untuk metode flat" });
    }

    await config.update(payload);
    res.json(config);
  } catch (err) {
    console.error("❌ Gagal update BonusConfig:", err);
    res.status(400).json({ error: "Gagal update bonus config" });
  }
};

// 🗑️ Hapus config
exports.deleteBonusConfig = async (req, res) => {
  try {
    const config = await BonusConfig.findByPk(req.params.id);
    if (!config) {
      return res.status(404).json({ error: "Data tidak ditemukan" });
    }

    await config.destroy();
    res.json({ message: "✅ BonusConfig berhasil dihapus" });
  } catch (err) {
    console.error("❌ Gagal hapus BonusConfig:", err);
    res.status(500).json({ error: "Server error" });
  }
};

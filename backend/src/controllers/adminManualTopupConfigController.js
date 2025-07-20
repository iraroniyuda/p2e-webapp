const ManualTopupConfig = require("../models/ManualTopupConfig");

// 🔍 Ambil semua konfigurasi
const getAllManualTopupConfigs = async (req, res) => {
  try {
    const configs = await ManualTopupConfig.findAll({
      order: [["fromType", "ASC"], ["toType", "ASC"]],
    });
    res.json(configs);
  } catch (err) {
    console.error("❌ Error fetching manual top-up configs:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✏️ Update satu konfigurasi berdasarkan ID
const updateManualTopupConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const config = await ManualTopupConfig.findByPk(id);
    if (!config) {
      return res.status(404).json({ error: "Config not found" });
    }

    await config.update(req.body);
    res.json({ message: "Updated successfully", data: config });
  } catch (err) {
    console.error("❌ Error updating manual top-up config:", err);
    res.status(500).json({ error: "Update failed" });
  }
};

module.exports = {
  getAllManualTopupConfigs,
  updateManualTopupConfig,
};

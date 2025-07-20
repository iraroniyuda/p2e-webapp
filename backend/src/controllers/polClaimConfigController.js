const PolClaimConfig = require("../models/PolClaimConfig");

// PATCH /api/pol-claim-config
const updatePolClaimConfig = async (req, res) => {
  try {
    const { levelName, amountPOL } = req.body;
    if (!levelName || amountPOL === undefined || isNaN(amountPOL)) {
      return res.status(400).json({ error: "levelName dan amountPOL wajib diisi & valid." });
    }

    const config = await PolClaimConfig.findOne({ where: { levelName } });
    if (!config) return res.status(404).json({ error: "Config POL tidak ditemukan untuk level tersebut." });

    config.amountPOL = amountPOL;
    await config.save();

    res.json({ success: true, data: config });
  } catch (err) {
    res.status(500).json({ error: "Gagal update config POL", detail: err.message });
  }
};

// GET /api/pol-claim-config
const listPolClaimConfig = async (req, res) => {
  try {
    const list = await PolClaimConfig.findAll({ order: [["id", "ASC"]] });
    res.json({ data: list });
  } catch (err) {
    res.status(500).json({ error: "Gagal ambil daftar config POL", detail: err.message });
  }
};

module.exports = {
  updatePolClaimConfig,
  listPolClaimConfig,
};

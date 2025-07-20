const SbpSourceRule = require("../models/SbpSourceRule");

// 🔹 GET /admin/sbp-source-rules
exports.getAllSourceRules = async (req, res) => {
  try {
    const rules = await SbpSourceRule.findAll({ order: [["source", "ASC"]] });
    res.json(rules);
  } catch (err) {
    console.error("❌ Gagal ambil SbpSourceRule:", err);
    res.status(500).json({ error: "Gagal ambil rules" });
  }
};

// 🔹 POST /admin/sbp-source-rules
exports.createSourceRule = async (req, res) => {
  try {
    const { source, locked, durationDays } = req.body;
    const rule = await SbpSourceRule.create({ source, locked, durationDays });
    res.json(rule);
  } catch (err) {
    console.error("❌ Gagal buat SbpSourceRule:", err);
    res.status(500).json({ error: "Gagal tambah rule" });
  }
};

// 🔹 PUT /admin/sbp-source-rules/:id
exports.updateSourceRule = async (req, res) => {
  try {
    const { id } = req.params;
    const { locked, durationDays } = req.body;

    const rule = await SbpSourceRule.findByPk(id);
    if (!rule) return res.status(404).json({ error: "Rule tidak ditemukan" });

    rule.locked = locked;
    rule.durationDays = durationDays;
    await rule.save();

    res.json(rule);
  } catch (err) {
    console.error("❌ Gagal update SbpSourceRule:", err);
    res.status(500).json({ error: "Gagal update rule" });
  }
};

// 🔹 DELETE /admin/sbp-source-rules/:id
exports.deleteSourceRule = async (req, res) => {
  try {
    const { id } = req.params;
    await SbpSourceRule.destroy({ where: { id } });
    res.json({ message: "Rule dihapus" });
  } catch (err) {
    console.error("❌ Gagal hapus SbpSourceRule:", err);
    res.status(500).json({ error: "Gagal hapus rule" });
  }
};

const TbpToRupiahRateConfig = require("../models/TbpToRupiahRateConfig");

// GET semua rate
exports.getAllRates = async (req, res) => {
  try {
    const rates = await TbpToRupiahRateConfig.findAll();
    res.json(rates);
  } catch (err) {
    console.error("❌ Gagal ambil data rate:", err);
    res.status(500).json({ message: "Gagal ambil data rate" });
  }
};

// POST / UPDATE rate
exports.setRate = async (req, res) => {
  try {
    const { type, rate } = req.body;

    if (!["user_to_company", "user_to_exchanger", "exchanger_to_company"].includes(type)) {
      return res.status(400).json({ message: "Tipe tidak valid." });
    }

    const [config, created] = await TbpToRupiahRateConfig.findOrCreate({
      where: { type },
      defaults: { rate },
    });

    if (!created) {
      config.rate = rate;
      await config.save();
    }

    res.json({
      message: created ? "Rate berhasil dibuat." : "Rate berhasil diperbarui.",
      config,
    });
  } catch (err) {
    console.error("❌ Gagal set rate:", err);
    res.status(500).json({ message: "Gagal set rate." });
  }
};

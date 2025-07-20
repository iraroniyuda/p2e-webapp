const Decimal = require("decimal.js");
const SbpToTbpConversionRate = require("../models/SbpToTbpConversionRate");

exports.getCurrentConversionRate = async (req, res) => {
  try {
    const rate = await SbpToTbpConversionRate.findOne({ order: [["createdAt", "DESC"]] });

    if (!rate) {
      return res.status(404).json({ error: "Rasio belum diatur." });
    }

    const plain = rate.get({ plain: true });
    for (const key in plain) {
      if (plain[key] instanceof Decimal) {
        plain[key] = plain[key].toString();
      }
    }

    res.json(plain);
  } catch (err) {
    console.error("❌ Gagal ambil rasio:", err);
    res.status(500).json({ error: "Gagal ambil rasio konversi." });
  }
};

exports.setConversionRate = async (req, res) => {
  try {
    const { sbpAmount, tbpAmount } = req.body;

    let sbp, tbp;
    try {
      sbp = new Decimal(sbpAmount);
      tbp = new Decimal(tbpAmount);
    } catch {
      return res.status(400).json({ error: "Nilai SBP dan TBP harus angka valid." });
    }

    if (sbp.lte(0) || tbp.lte(0)) {
      return res.status(400).json({ error: "Nilai SBP dan TBP harus lebih dari 0." });
    }

    const latest = await SbpToTbpConversionRate.findOne({ order: [["createdAt", "DESC"]] });

    let result;
    if (latest) {
      latest.sbpAmount = sbp.toFixed(); // Simpan sebagai string
      latest.tbpAmount = tbp.toFixed();
      await latest.save();
      result = latest;
    } else {
      result = await SbpToTbpConversionRate.create({
        sbpAmount: sbp.toFixed(),
        tbpAmount: tbp.toFixed(),
      });
    }

    const plain = result.get({ plain: true });
    for (const key in plain) {
      if (plain[key] instanceof Decimal) {
        plain[key] = plain[key].toString();
      }
    }

    res.json({ message: "✅ Rasio berhasil disimpan", data: plain });
  } catch (err) {
    console.error("❌ Gagal set rasio:", err);
    res.status(500).json({ error: "Gagal menyimpan rasio." });
  }
};

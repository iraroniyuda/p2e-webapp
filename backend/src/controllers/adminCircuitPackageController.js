const CircuitOwnerPackage = require("../models/CircuitOwnerPackage");
const Decimal = require("decimal.js");

/**
 * GET semua paket Circuit Owner
 */
const listPackages = async (req, res) => {
  try {
    const packages = await CircuitOwnerPackage.findAll({
      order: [["name", "ASC"]],
    });
    res.json(packages);
  } catch (err) {
    console.error("❌ Gagal ambil paket:", err);
    res.status(500).json({ error: "Gagal ambil paket." });
  }
};

/**
 * UPDATE paket berdasarkan ID
 */
const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { priceSBP, cashbackSBP, isActive } = req.body;

    const pkg = await CircuitOwnerPackage.findByPk(id);
    if (!pkg) return res.status(404).json({ error: "Paket tidak ditemukan." });

    pkg.priceSBP = new Decimal(priceSBP || "0").toFixed();
    pkg.cashbackSBP = new Decimal(cashbackSBP || "0").toFixed();
    pkg.isActive = !!isActive;

    await pkg.save();
    res.json({ success: true, message: "Paket berhasil diperbarui." });
  } catch (err) {
    console.error("❌ Gagal update paket:", err);
    res.status(500).json({ error: "Gagal update paket." });
  }
};

module.exports = {
  listPackages,
  updatePackage,
};

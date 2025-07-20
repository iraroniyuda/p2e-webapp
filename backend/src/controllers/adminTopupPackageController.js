const TopupPackage = require("../models/TopupPackage");
const Decimal = require("decimal.js");

// 🔸 INT only helper (for rupiah)
const toIntOrNull = (v) => {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "string") {
    const cleaned = v.replace(/[^\d]/g, ""); // hapus titik/koma
    if (!cleaned) return null;
    const parsed = parseInt(cleaned);
    return isNaN(parsed) ? null : parsed;
  }
  if (typeof v === "number") return v;
  return null;
};

// 🔸 DECIMAL string helper (for token)
const toDecimalStringOrNull = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const str = typeof v === "number" ? v.toString() : v;
  try {
    return new Decimal(str).toFixed(); // presisi tinggi
  } catch {
    return null;
  }
};

// ✅ GET semua paket
const getTopupPackages = async (req, res) => {
  try {
    const packages = await TopupPackage.findAll({ order: [["id", "ASC"]] });

    // Convert Decimal field ke string agar aman di frontend
    const result = packages.map((pkg) => {
      const plain = pkg.get({ plain: true });
      for (const key in plain) {
        if (plain[key] instanceof Decimal) {
          plain[key] = plain[key].toString();
        }
      }
      return plain;
    });

    res.json(result);
  } catch (err) {
    console.error("❌ Error fetch packages:", err);
    res.status(500).json({ error: "Internal error" });
  }
};

// ✅ UPDATE paket topup
const updateTopupPackage = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📥 Request to update TopupPackage:", { id, body: req.body });

    const pkg = await TopupPackage.findByPk(id);
    if (!pkg) {
      console.warn(`⚠️ Package ID ${id} not found`);
      return res.status(404).json({ error: "Package not found" });
    }

    const {
      title,
      priceRupiah, priceSBP, priceRACE, priceTBP,
      obtainedSBP, obtainedRACE, obtainedTBP,
      valueRupiah, valueSBP, valueRACE, valueTBP,
      bonusDescription, soldBy, exchangerId
    } = req.body;

    await pkg.update({
      title,
      priceRupiah: toIntOrNull(priceRupiah),
      priceSBP: toDecimalStringOrNull(priceSBP),
      priceRACE: toDecimalStringOrNull(priceRACE),
      priceTBP: toDecimalStringOrNull(priceTBP),
      obtainedSBP: toDecimalStringOrNull(obtainedSBP),
      obtainedRACE: toDecimalStringOrNull(obtainedRACE),
      obtainedTBP: toDecimalStringOrNull(obtainedTBP),
      valueRupiah: toIntOrNull(valueRupiah),
      valueSBP: toDecimalStringOrNull(valueSBP),
      valueRACE: toDecimalStringOrNull(valueRACE),
      valueTBP: toDecimalStringOrNull(valueTBP),
      bonusDescription,
      soldBy,
      exchangerId,
    });

    const result = pkg.get({ plain: true });
    for (const key in result) {
      if (result[key] instanceof Decimal) {
        result[key] = result[key].toString();
      }
    }

    console.log("✅ Package updated successfully:", result);
    res.json({ message: "Updated successfully", data: result });
  } catch (err) {
    console.error("❌ Error updating TopupPackage:", err);
    res.status(500).json({ error: "Update failed" });
  }
};

// ✅ GET semua jenis transaksi top-up (untuk BonusConfig)
const getTopupTransactionTypes = async (req, res) => {
  try {
    const packages = await TopupPackage.findAll({
      attributes: [
        "id",
        "title",
        "valueRupiah",
        "valueSBP",
        "valueRACE",
        "valueTBP",
      ],
    });

    const transactionTypes = [
      {
        key: "manual_topup",
        label: "Top-Up Manual S-BP",
        values: {
          valueRupiah: null,
          valueSBP: null,
          valueRACE: null,
          valueTBP: null,
        },
      },
      ...packages.map((pkg) => {
        const plain = pkg.get({ plain: true });
        for (const key in plain) {
          if (plain[key] instanceof Decimal) {
            plain[key] = plain[key].toString();
          }
        }

        return {
          key: `buy_package_${plain.id}`,
          label: `Pembelian: ${plain.title}`,
          values: {
            valueRupiah: plain.valueRupiah,
            valueSBP: plain.valueSBP,
            valueRACE: plain.valueRACE,
            valueTBP: plain.valueTBP,
          },
        };
      }),
    ];

    res.json(transactionTypes);
  } catch (err) {
    console.error("❌ Gagal ambil jenis transaksi topup:", err);
    res.status(500).json({ error: "Internal error" });
  }
};

module.exports = {
  getTopupPackages,
  updateTopupPackage,
  getTopupTransactionTypes,
};

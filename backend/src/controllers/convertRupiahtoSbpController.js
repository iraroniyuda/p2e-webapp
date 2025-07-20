const Decimal = require("decimal.js");
const sequelize = require("../config/database");
const User = require("../models/User");
const UserBalance = require("../models/UserBalance");
const ManualTopupConfig = require("../models/ManualTopupConfig");
const SbpTokenHistory = require("../models/SbpTokenHistory");
const grantSbpWithSource = require("../utils/grantSbpWithSource");

const convertRupiahToSbp = async function (req, res) {
  const t = await sequelize.transaction();

  try {
    const { sbpAmount } = req.body;
    const userId = req.user.id;
    const amount = new Decimal(sbpAmount || 0);

    if (amount.lte(0)) {
      await t.rollback();
      return res.status(400).json({ error: "Jumlah SBP tidak valid." });
    }

    const user = await User.findByPk(userId);
    if (!user || user.exchangerLevel === "none") {
      await t.rollback();
      return res.status(403).json({ error: "Hanya user exchanger yang dapat menukar." });
    }

    const config = await ManualTopupConfig.findOne({
      where: { fromType: "company", toType: "user_exchanger" },
      transaction: t,
    });

    if (!config?.priceRupiah) {
      await t.rollback();
      return res.status(500).json({ error: "Konfigurasi harga belum tersedia." });
    }

    const sbpPrice = new Decimal(config.priceRupiah);
    const rupiahRequired = sbpPrice.mul(amount).toDecimalPlaces(0);

    const balance = await UserBalance.findOne({ where: { userId }, transaction: t });
    if (new Decimal(balance.rupiah).lt(rupiahRequired)) {
      await t.rollback();
      return res.status(400).json({ error: "Saldo rupiah tidak cukup." });
    }

    balance.rupiah = new Decimal(balance.rupiah).minus(rupiahRequired).toFixed(0);

    console.log("🚀 Sebelum grantSbpWithSource");
    await grantSbpWithSource(userId, amount, "rupiah_to_sbp_exchange", "PublicSale", { transaction: t });
    console.log("✅ Sesudah grantSbpWithSource");

    await balance.save({ transaction: t });
    await t.commit();

    res.json({
      message: `Penukaran berhasil: ${amount} SBP ditambahkan, ${rupiahRequired} rupiah dikurangi.`,
      sbpAmount: amount.toFixed(),
      rupiahDeducted: rupiahRequired.toFixed(),
    });
  } catch (err) {
    await t.rollback();
    console.error("❌ convertRupiahToSbp: Terjadi kesalahan:", err);
    res.status(500).json({ error: "Gagal melakukan konversi. Silakan coba lagi." });
  }
};

const getRupiahToSbpHistory = async function (req, res) {
  const userId = req.user.id;

  try {
    const user = await User.findByPk(userId);
    if (!user || user.exchangerLevel === "none") {
      return res.status(403).json({ error: "Hanya user exchanger yang dapat mengakses histori." });
    }

    const history = await SbpTokenHistory.findAll({
      where: {
        type: "sale",
        createdBy: userId,
      },
      order: [["createdAt", "DESC"]],
    });

    res.json({ history });
  } catch (err) {
    console.error("❌ Gagal mengambil histori penukaran:", err);
    res.status(500).json({ error: "Gagal mengambil histori penukaran." });
  }
};

module.exports = {
  convertRupiahToSbp,
  getRupiahToSbpHistory,
};

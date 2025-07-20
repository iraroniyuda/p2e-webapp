const { Decimal } = require("decimal.js");
const CircuitOwnerPackage = require("../models/CircuitOwnerPackage");
const User = require("../models/User");
const UserBalance = require("../models/UserBalance");
const UserBonusLog = require("../models/UserBonusLog");
const SbpBalanceDetail = require("../models/SbpBalanceDetail");
const sequelize = require("../config/database");

const buyCircuitOwnerPackage = async (req, res) => {
  const userId = req.user.id; // diasumsikan middleware verifyToken sudah attach user

  try {
    const { packageName } = req.body;
    if (!packageName) return res.status(400).json({ error: "Nama paket wajib diisi." });

    const circuitPackage = await CircuitOwnerPackage.findOne({
      where: { name: packageName.toLowerCase(), isActive: true },
    });

    if (!circuitPackage) {
      return res.status(404).json({ error: "Paket tidak ditemukan atau tidak aktif." });
    }

    const user = await User.findByPk(userId);
    const balance = await UserBalance.findOne({ where: { userId } });

    if (!balance) {
      return res.status(404).json({ error: "Saldo tidak ditemukan." });
    }

    const available = balance.sbpAvailable;
    const price = circuitPackage.priceSBP;
    const cashback = circuitPackage.cashbackSBP;

    if (available.lt(price)) {
      return res.status(400).json({ error: "Saldo SBP tidak cukup." });
    }

    // Jalankan transaksi atomik
    await sequelize.transaction(async (t) => {
      // Potong saldo
      balance.sbpAvailable = available.minus(price);
      balance.sbp = balance.sbp.minus(price).plus(cashback);
      await balance.save({ transaction: t });

      // ✅ Catat pengurangan sebagai minus
      await SbpBalanceDetail.create({
        userId,
        source: `purchase_circuit_${packageName}`,
        amount: new Decimal(price).negated().toFixed(),
        lockedUntil: null,
      }, { transaction: t });

      // Tambah cashback ke log dan detail
      if (cashback.gt(0)) {
        const note = `Cashback pembelian paket Circuit Owner (${packageName})`;

        await UserBonusLog.create({
          userId,
          asset: "SBP",
          amount: cashback.toFixed(),
          note,
          bonusConfigId: null,
        }, { transaction: t });

        await SbpBalanceDetail.create({
          userId,
          source: `cashback_${packageName}`,
          amount: cashback.toFixed(),
          lockedUntil: null,
        }, { transaction: t });
      }

      // Update user level
      user.circuitOwnerLevel = packageName;
      await user.save({ transaction: t });
    });



    return res.json({
      success: true,
      message: `Berhasil membeli paket Circuit Owner level ${packageName}.`,
    });
  } catch (err) {
    console.error("❌ Gagal beli paket circuit owner:", err);
    res.status(500).json({ error: "Terjadi kesalahan saat pembelian." });
  }
};

const getAllCircuitOwnerPackages = async (req, res) => {
  try {
    const packages = await CircuitOwnerPackage.findAll({
      where: { isActive: true },
      order: [["priceSBP", "ASC"]],
    });
    res.json(packages);
  } catch (err) {
    console.error("❌ Gagal ambil daftar paket:", err);
    res.status(500).json({ error: "Gagal ambil data paket." });
  }
};

module.exports = {
  buyCircuitOwnerPackage,
  getAllCircuitOwnerPackages,
};
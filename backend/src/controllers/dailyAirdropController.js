const moment = require("moment");
const { Op } = require("sequelize");
const Decimal = require("decimal.js");

const DailyAirdropConfig = require("../models/DailyAirdropConfig");
const DailyAirdropClaimLog = require("../models/DailyAirdropClaimLog");
const UserDailyAirdropProgress = require("../models/UserDailyAirdropProgress");
const UserTransaction = require("../models/UserTransaction");
const grantSbpWithSource = require("../utils/grantSbpWithSource");
const SbpPool = require("../models/SbpPool");


// 🔹 GET /admin/daily-airdrop/config
exports.getDailyAirdropConfig = async (req, res) => {
  try {
    const [config] = await DailyAirdropConfig.findOrCreate({
      where: {},
      defaults: {
        minTransactionAmount: "15000",
        periodDays: 20,
        sbpReward: "1",
        requiredLoginDays: 7,
      },
    });

    res.json(config);
  } catch (err) {
    console.error("❌ Gagal ambil config airdrop harian:", err);
    res.status(500).json({ error: "Gagal ambil config" });
  }
};


// 🔹 POST /admin/daily-airdrop/config/update
exports.updateDailyAirdropConfig = async (req, res) => {
  try {
    const { minTransactionAmount, periodDays, sbpReward, requiredLoginDays } = req.body;
    const [config] = await DailyAirdropConfig.findOrCreate({ where: {} });

    config.minTransactionAmount = minTransactionAmount.toString();
    config.periodDays = parseInt(periodDays);
    config.sbpReward = sbpReward.toString();
    config.requiredLoginDays = parseInt(requiredLoginDays);

    await config.save();

    res.json({ message: "✅ Config berhasil diperbarui", config });
  } catch (err) {
    console.error("❌ Gagal update config airdrop harian:", err);
    res.status(500).json({ error: "Gagal update config" });
  }
};

exports.getDailyAirdropStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const config = await DailyAirdropConfig.findOne();
    if (!config) return res.status(400).json({ error: "Config belum tersedia" });

    const progress = await UserDailyAirdropProgress.findOne({ where: { userId } });
    const loginStreak = progress?.loginStreak || 0;
    const pendingSbp = new Decimal(progress?.pendingSbp || 0);

    const since = moment().subtract(config.periodDays, "days").toDate();
    const total = await UserTransaction.sum("amount", {
      where: { userId, status: "Sales", createdAt: { [Op.gte]: since } },
    });

    const totalAmount = new Decimal(total || 0);
    const eligible = loginStreak >= config.requiredLoginDays &&
                     totalAmount.greaterThanOrEqualTo(config.minTransactionAmount);

    return res.json({
      loginStreak,
      requiredLoginDays: config.requiredLoginDays,
      totalTransactionAmount: totalAmount.toFixed(),
      requiredMinimum: config.minTransactionAmount.toString(),
      rewardAmount: pendingSbp.toFixed(),
      eligible,
    });
  } catch (err) {
    console.error("❌ Gagal ambil status airdrop:", err);
    res.status(500).json({ error: "Gagal ambil status airdrop" });
  }
};


// 🔹 GET /user/daily-airdrop/eligibility
exports.checkEligibility = async (req, res) => {
  try {
    const userId = req.user.id;
    const config = await DailyAirdropConfig.findOne();
    if (!config) return res.status(400).json({ error: "Konfigurasi airdrop belum tersedia" });

    const today = moment().format("YYYY-MM-DD");

    const existingClaim = await DailyAirdropClaimLog.findOne({
      where: { userId, date: today },
    });

    const alreadyClaimed = !!existingClaim;
    const startDate = moment().subtract(config.periodDays, "days").toDate();

    const totalTrans = await UserTransaction.sum("amount", {
      where: {
        userId,
        status: "Sales",
        createdAt: { [Op.gte]: startDate },
      },
    });

    const totalAmount = new Decimal(totalTrans || 0);
    const minAmount = new Decimal(config.minTransactionAmount);
    const eligible = totalAmount.greaterThanOrEqualTo(minAmount);

    return res.json({
      eligible,
      alreadyClaimed,
      totalTransactionAmount: totalAmount.toFixed(),
      requiredMinimum: minAmount.toFixed(),
      rewardAmount: new Decimal(config.sbpReward).toFixed(),
    });
  } catch (err) {
    console.error("❌ Gagal cek eligibility:", err);
    return res.status(500).json({ error: "Gagal cek kelayakan klaim airdrop" });
  }
};

// 🔹 POST /user/daily-airdrop/claim
exports.claimDailyAirdrop = async (req, res) => {
  const sequelize = require("../config/database");
  const transaction = await sequelize.transaction();

  try {
    const userId = req.user.id;
    const today = moment().format("YYYY-MM-DD");

    const config = await DailyAirdropConfig.findOne();
    if (!config) return res.status(400).json({ error: "Config belum tersedia" });

    const progress = await UserDailyAirdropProgress.findOne({ where: { userId } });
    if (!progress) return res.status(400).json({ error: "Belum ada progress login" });

    const loginStreak = progress.loginStreak;
    const pendingSbp = new Decimal(progress.pendingSbp || 0);
    if (loginStreak < config.requiredLoginDays) {
      return res.status(400).json({ error: `Minimal login ${config.requiredLoginDays} hari untuk klaim` });
    }

    const since = moment().subtract(config.periodDays, "days").toDate();
    const total = await UserTransaction.sum("amount", {
      where: { userId, status: "Sales", createdAt: { [Op.gte]: since } },
    });

    const totalDecimal = new Decimal(total || 0);
    if (totalDecimal.lessThan(config.minTransactionAmount)) {
      return res.status(400).json({ error: "Transaksi tidak mencukupi untuk klaim" });
    }

    if (pendingSbp.lte(0)) {
      return res.status(400).json({ error: "Tidak ada reward untuk diklaim" });
    }

    // ✅ Grant SBP ke balance
    await grantSbpWithSource(userId, pendingSbp.toString(), "daily-airdrop", "Airdrop", {
      transaction,
      note: `Klaim airdrop login ${loginStreak} hari`,
    });

    // ✅ Update SBP pool
    const [pool] = await SbpPool.findOrCreate({
      where: { id: 1 },
      defaults: {
        totalMinted: "0",
        totalBurned: "0",
        totalTransferred: "0",
        totalMined: "0",
        airdropped: "0",
      },
      transaction,
    });

    pool.airdropped = new Decimal(pool.airdropped || 0).plus(pendingSbp).toString();
    await pool.save({ transaction });

    // ✅ Log klaim
    await DailyAirdropClaimLog.create({
      userId,
      date: today,
      sbpReceived: pendingSbp.toString(),
    }, { transaction });

    // ✅ Reset progress
    progress.loginStreak = 0;
    progress.pendingSbp = "0";
    await progress.save({ transaction });

    await transaction.commit();
    res.json({ message: `✅ Berhasil klaim ${pendingSbp.toFixed()} SBP` });

  } catch (err) {
    await transaction.rollback();
    console.error("❌ Gagal klaim airdrop:", err);
    res.status(500).json({ error: "Gagal klaim airdrop harian" });
  }
};


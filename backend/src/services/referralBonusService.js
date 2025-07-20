const Decimal = require("decimal.js");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

const User = require("../models/User");
const UserBalance = require("../models/UserBalance");
const ReferralSignupBonusConfig = require("../models/ReferralSignupBonusConfig");
const ReferralSignupBonusLog = require("../models/ReferralSignupBonusLog");
const SbpBalanceDetail = require("../models/SbpBalanceDetail");
const SbpTokenHistory = require("../models/SbpTokenHistory");

exports.giveReferralSignupBonus = async (user) => {
  console.log("🚀 giveReferralSignupBonus untuk user:", user?.id, user?.username);

  if (!user.referredById) {
    console.log("⚠️ Tidak ada referredById, bonus tidak diberikan");
    return;
  }

  const alreadyGiven = await ReferralSignupBonusLog.findOne({
    where: { downlineUserId: user.id },
  });
  if (alreadyGiven) {
    console.log("⛔ Bonus sudah pernah diberikan sebelumnya");
    return;
  }

  const referrer = await User.findByPk(user.referredById);
  if (!referrer) {
    console.log("❌ Referrer tidak ditemukan");
    return;
  }

  const config = await ReferralSignupBonusConfig.findOne();
  console.log("🎯 Config loaded:", config);
  const bonusAmount = new Decimal(config?.bonusPerSignup || 0);
  if (bonusAmount.lte(0)) {
    console.log("❌ Bonus 0, tidak diberikan");
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  const startOfDay = new Date(`${today}T00:00:00`);
  const endOfDay = new Date(`${today}T23:59:59`);

  const [totalToday, totalAll] = await Promise.all([
    ReferralSignupBonusLog.sum("amount", {
      where: {
        uplineUserId: referrer.id,
        createdAt: { [Op.between]: [startOfDay, endOfDay] },
      },
    }),
    ReferralSignupBonusLog.sum("amount", {
      where: { uplineUserId: referrer.id },
    }),
  ]);

  const canGiveDaily = !config.maxDailyBonus || new Decimal(totalToday || 0).plus(bonusAmount).lte(config.maxDailyBonus);
  const canGiveTotal = !config.maxTotalBonus || new Decimal(totalAll || 0).plus(bonusAmount).lte(config.maxTotalBonus);

  console.log("📊 totalToday:", totalToday, "| totalAll:", totalAll);
  console.log("📌 canGiveDaily:", canGiveDaily, "| canGiveTotal:", canGiveTotal);

  if (!canGiveDaily || !canGiveTotal) {
    console.log("⛔ Melebihi batas harian atau total");
    return;
  }

  // ✅ Gunakan transaksi untuk memastikan atomicity
  const transaction = await sequelize.transaction();
  try {
    const [balance] = await UserBalance.findOrCreate({
      where: { userId: referrer.id },
      transaction,
    });

    balance.sbp = new Decimal(balance.sbp || 0).plus(bonusAmount).toFixed();
    await balance.save({ transaction });

    await ReferralSignupBonusLog.create({
      uplineUserId: referrer.id,
      downlineUserId: user.id,
      amount: bonusAmount.toFixed(),
    }, { transaction });

    await SbpBalanceDetail.create({
      userId: referrer.id,
      source: "referral-signup",
      amount: bonusAmount.toFixed(),
      lockedUntil: null,
    }, { transaction });

    await SbpTokenHistory.create({
      type: "bonus",
      bonus: bonusAmount.toFixed(),
      totalSupply: null,
      note: `Bonus referral signup dari user ${user.username}`,
      createdBy: user.id,
    }, { transaction });

    await transaction.commit();
    console.log(`✅ Bonus ${bonusAmount} SBP diberikan ke ${referrer.username}`);
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Gagal memberikan referral signup bonus:", error);
  }
};

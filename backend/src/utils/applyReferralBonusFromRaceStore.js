const { Decimal } = require("decimal.js");
const User = require("../models/User");
const RaceReferralBonusConfig = require("../models/RaceReferralBonusConfig");
const grantSbpWithSource = require("./grantSbpWithSource");

module.exports = async function applyReferralBonusFromRaceStore(user, asset) {
  try {
    const valueSBP = new Decimal(asset.valueSBP || 0);
    if (valueSBP.lte(0)) return;

    const configs = await RaceReferralBonusConfig.findAll();
    const configMap = {};
    for (const c of configs) configMap[c.userLevel] = c;

    // ========== 🎯 DIRECT BONUS (GEN 1) ==========
    const directReferrer = await User.findByPk(user.referredById);
    if (directReferrer && ["green", "blue", "double_blue"].includes(directReferrer.userLevel)) {
      const levelConfig = configMap[directReferrer.userLevel];
      const directBonus = valueSBP
        .mul(levelConfig.directBonusPercent)
        .div(100)
        .toDecimalPlaces(18, Decimal.ROUND_DOWN);

      if (directBonus.gt(0)) {
        console.log(`🎁 Direct Bonus: ${directBonus.toFixed()} SBP → ${directReferrer.username}`);
        await grantSbpWithSource(directReferrer.id, directBonus.toFixed(), "referral_direct_bonus", "RaceStore");
      }
    }

    // ========== 🧬 GENERATIONAL BONUS (GEN 1–6) ==========
    let currentUser = user;
    for (let gen = 1; gen <= 6; gen++) {
      if (!currentUser.referredById) break;

      const upline = await User.findByPk(currentUser.referredById);
      if (!upline) break;

      const levelConfig = configMap[upline.userLevel];
      if (!levelConfig) {
        currentUser = upline;
        continue;
      }

      const percent = levelConfig[`gen${gen}BonusPercent`] || 0;
      const genBonus = valueSBP
        .mul(percent)
        .div(100)
        .toDecimalPlaces(18, Decimal.ROUND_DOWN);

      if (genBonus.gt(0)) {
        console.log(`🔁 Gen ${gen} Bonus: ${genBonus.toFixed()} SBP → ${upline.username}`);
        await grantSbpWithSource(upline.id, genBonus.toFixed(), `referral_gen${gen}_bonus`, "RaceStore");
      }

      currentUser = upline;
    }

  } catch (err) {
    console.error("❌ Gagal apply referral bonus dari RaceStore:", err);
  }
};

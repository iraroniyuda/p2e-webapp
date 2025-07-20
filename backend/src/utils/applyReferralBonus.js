const { Decimal } = require("decimal.js");
const BonusConfig = require("../models/BonusConfig");
const User = require("../models/User");
const UserBalance = require("../models/UserBalance");
const UserBonusLog = require("../models/UserBonusLog");
const grantSbpWithSource = require("./grantSbpWithSource");

// Tambah saldo user selain SBP
const addBalance = async (userId, asset, value) => {
  const assetMap = {
    SBP: "sbp",
    RACE: "race",
    TBP: "tbp",
    IDR: "rupiah",
  };
  const column = assetMap[asset];
  if (!column) throw new Error(`❌ Bonus asset '${asset}' tidak dikenali`);

  const [balance] = await UserBalance.findOrCreate({ where: { userId } });
  const current = new Decimal(balance[column] || 0);
  balance[column] = current.plus(value).toFixed();
  await balance.save();
};

// Eksekusi pemberian bonus
const executeBonus = async (userId, asset, amount, note = "referral_bonus") => {
  const decAmount = new Decimal(amount || 0);
  if (decAmount.lte(0)) return;

  if (asset === "SBP") {
    await grantSbpWithSource(userId, decAmount.toFixed(), note, "Bonus");
  } else {
    await addBalance(userId, asset, decAmount.toFixed());
  }
};

// Hitung nilai bonus
const calculateBonus = (method, valueConfig, baseValue) => {
  const base = new Decimal(baseValue || 0);
  if (method === "percent") {
    const percent = new Decimal(valueConfig?.bonusPercentage || 0);
    return base.mul(percent).div(100).toDecimalPlaces(18, Decimal.ROUND_DOWN);
  } else if (method === "flat") {
    return new Decimal(valueConfig?.bonusAmount || 0);
  }
  return new Decimal(0);
};

// Cek level user cocok
const matchLevel = (user, level) => {
  if (!level) return false;
  return level.startsWith("exchanger:")
    ? user.exchangerLevel === level.split(":")[1]
    : user.userLevel === level;
};

// Cek apakah user sudah pernah dapat bonus jenis tertentu dari grup ini
const hasReceivedBonusInGroup = async (userId, groupName, bonusType) => {
  if (!groupName) return false;
  const found = await UserBonusLog.findOne({
    where: { userId, exclusiveGroup: groupName, bonusType },
  });
  return !!found;
};

// Catat bahwa user sudah dapat bonus ini
const logBonusGiven = async (userId, config, bonusType) => {
  await UserBonusLog.create({
    userId,
    bonusConfigId: config.id,
    exclusiveGroup: config.exclusiveGroup,
    transactionType: config.transactionType,
    bonusType,
  });
};

// Fungsi utama
module.exports = async function applyReferralBonus(user, transactionType, transactionValues) {
  try {
    const configs = await BonusConfig.findAll({ where: { transactionType } });
    console.log(`📦 ${configs.length} config ditemukan untuk type: ${transactionType}`);

    for (const config of configs) {
      const {
        method,
        bonusAsset,
        userLevel,
        referralBonuses,
        exclusiveGroup,
        exclusiveGroupScope,
        basedOn,
        basedOnGenerational,
        value,
      } = config;

      if (!user.referredById) continue;

      // 🧬 Bonus Generasi
      if (Array.isArray(referralBonuses) && referralBonuses.length > 0) {
        let currentUser = user;
        const baseGen = new Decimal(transactionValues[basedOnGenerational] || 0);

        for (let gen = 0; gen < referralBonuses.length; gen++) {
          const referrer = await User.findByPk(currentUser.referredById);
          if (!referrer) break;

          const genConfig = referralBonuses[gen];
          if (!genConfig || !matchLevel(referrer, userLevel)) {
            currentUser = referrer;
            continue;
          }

          if (
            exclusiveGroup &&
            (exclusiveGroupScope === "bonusOnly" || exclusiveGroupScope === "configAll")
          ) {
            const already = await hasReceivedBonusInGroup(referrer.id, exclusiveGroup, "generational");
            if (already) {
              console.log(`🚫 Gen ${gen + 1}: ${referrer.username} sudah dapat bonus generational dari grup '${exclusiveGroup}'`);
              break;
            }
          }

          const bonusAmount = calculateBonus(method, genConfig, baseGen);
          if (bonusAmount.gt(0)) {
            console.log(`🎯 [Gen ${gen + 1}] ${bonusAmount.toFixed()} ${bonusAsset} → ${referrer.username}`);
            await executeBonus(referrer.id, bonusAsset, bonusAmount, "referral_generational_bonus");
            await logBonusGiven(referrer.id, config, "generational");
          }

          currentUser = referrer;
        }
      }

      // 🎁 Bonus Langsung
      const directReferrer = await User.findByPk(user.referredById);
      if (!directReferrer || !matchLevel(directReferrer, userLevel)) continue;

      if (
        exclusiveGroup &&
        (exclusiveGroupScope === "bonusOnly" || exclusiveGroupScope === "configAll")
      ) {
        const already = await hasReceivedBonusInGroup(directReferrer.id, exclusiveGroup, "direct");
        if (already) {
          console.log(`🚫 Lewatkan bonus langsung untuk ${directReferrer.username}, sudah dapat dari grup '${exclusiveGroup}'`);
          continue;
        }
      }

      const base = new Decimal(transactionValues[basedOn] || 0);
      const bonusAmount = method === "percent"
        ? base.mul(value).div(100).toDecimalPlaces(18, Decimal.ROUND_DOWN)
        : new Decimal(value || 0);

      if (bonusAmount.gt(0)) {
        console.log(`🎁 [Direct] ${bonusAmount.toFixed()} ${bonusAsset} → ${directReferrer.username}`);
        await executeBonus(directReferrer.id, bonusAsset, bonusAmount, "referral_direct_bonus");
        await logBonusGiven(directReferrer.id, config, "direct");
      }
    }
  } catch (err) {
    console.error("❌ Gagal apply referral bonus:", err);
  }
};

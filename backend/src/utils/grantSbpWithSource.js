const moment = require("moment");
const { Op } = require("sequelize");
const Decimal = require("decimal.js");

const UserBalance = require("../models/UserBalance");
const SbpBalanceDetail = require("../models/SbpBalanceDetail");
const SbpSourceRule = require("../models/SbpSourceRule");
const SbpTokenHistory = require("../models/SbpTokenHistory");
const SbpAllocationBalance = require("../models/SbpAllocationBalance");
const SbpPool = require("../models/SbpPool");
const User = require("../models/User");

const grantSbpWithSource = async (userId, amountRaw, source, category, options = {}) => {
  const { isMint = false, transaction = null, note = null } = options;
  const amount = new Decimal(amountRaw || 0);

  if (!userId || !source || !category || amount.lte(0)) {
    console.warn("⚠️ grantSbpWithSource: Parameter tidak valid", { userId, source, amount: amount.toString(), category });
    return;
  }

  try {
    const sourceLower = source.toLowerCase();
    const isMining = sourceLower.includes("mining");
    const isAirdrop = sourceLower.includes("airdrop");
    const isBonus = sourceLower.includes("bonus");
    const isSale = !isMint && !isMining && !isAirdrop && !isBonus;

    // 🔍 Cek aturan locking
    const rule = await SbpSourceRule.findOne({ where: { source }, transaction });
    const isLocked = rule?.locked || false;
    const lockedUntil = isLocked ? moment().add(rule?.durationDays || 0, "days").toDate() : null;

    // 💰 Tambahkan ke UserBalance
    const [balance] = await UserBalance.findOrCreate({ where: { userId }, transaction });
    await balance.increment("sbp", { by: amount.toFixed(), transaction });
    if (!isLocked) {
      await balance.increment("sbpAvailable", { by: amount.toFixed(), transaction });
    }

    // 💾 Detail asal saldo
    await SbpBalanceDetail.create({ userId, source, amount: amount.toFixed(), lockedUntil }, { transaction });

    // 🔻 Kurangi alokasi
    const allocation = await SbpAllocationBalance.findOne({ where: { category }, transaction });
    if (allocation) {
      const current = new Decimal(allocation.amount || 0);
      allocation.amount = current.minus(amount).toFixed();
      await allocation.save({ transaction });
    }

    // 🧾 Update Pool
    const [pool] = await SbpPool.findOrCreate({
      where: { id: 1 },
      defaults: {
        totalMinted: "0", totalBurned: "0", totalTransferred: "0",
        totalMined: "0", airdropped: "0", bonus: "0", sale: "0"
      },
      transaction,
    });

    const updateField = (field) => {
      const current = new Decimal(pool[field] || 0);
      pool[field] = current.plus(amount).toFixed();
    };

    if (isMint) updateField("totalMinted");
    else if (isMining) updateField("totalMined");
    else if (isAirdrop) updateField("airdropped");
    else if (isBonus) updateField("bonus");
    else if (isSale) updateField("sale");
    else updateField("totalTransferred");

    await pool.save({ transaction });

    const totalSupply = new Decimal(pool.totalMinted).minus(pool.totalBurned).toFixed();

    // 🪪 Nama user
    let username = `User#${userId}`;
    const user = await User.findByPk(userId, { transaction });
    if (user?.username) username = user.username;

    // 📝 Log histori token
    await SbpTokenHistory.create({
      type: isMining ? "mining"
        : isAirdrop ? "airdrop"
        : isMint ? "mint"
        : isBonus ? "bonus"
        : isSale ? "sale"
        : "transfer",

      mined: isMining ? amount.toFixed() : "0",
      airdropped: isAirdrop ? amount.toFixed() : "0",
      minted: isMint ? amount.toFixed() : "0",
      transferred: (!isMint && !isMining && !isAirdrop) ? amount.toFixed() : "0",
      burned: "0",
      sale: isSale ? amount.toFixed() : "0",
      totalSupply,
      note: note || `Grant from ${source} to ${username}`,
      createdBy: userId,
    }, { transaction });



    console.log(`✅ grantSbpWithSource: +${amount.toFixed()} SBP ke user ${userId} dari '${source}' [${category}]`);
  } catch (err) {
    console.error("❌ grantSbpWithSource: Gagal memberikan SBP", err);
    throw err;
  }
};

module.exports = grantSbpWithSource;

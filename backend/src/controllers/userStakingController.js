const moment = require("moment");
const Decimal = require("decimal.js");

const StakingConfig = require("../models/StakingConfig");
const UserStaking = require("../models/UserStaking");
const UserBalance = require("../models/UserBalance");
const SbpBalanceDetail = require("../models/SbpBalanceDetail");
const SbpPool = require("../models/SbpPool");
const SbpTokenHistory = require("../models/SbpTokenHistory");
const SbpAllocationBalance = require("../models/SbpAllocationBalance");

// 🔹 Stake SBP
exports.stakeSbp = async (req, res) => {
  try {
    const userId = req.user.id;
    const amount = new Decimal(req.body.amount || 0);

    if (amount.lte(0)) return res.status(400).json({ error: "Jumlah stake tidak valid." });

    const config = await StakingConfig.findOne();
    if (!config) return res.status(500).json({ error: "Konfigurasi staking belum tersedia." });

    if (amount.lt(config.minStakeAmount)) {
      return res.status(400).json({ error: `Minimal stake adalah ${config.minStakeAmount.toFixed()}` });
    }

    const userBalance = await UserBalance.findOne({ where: { userId } });
    if (!userBalance) return res.status(400).json({ error: "Saldo tidak ditemukan." });

    const nonSaleAvailable = userBalance.sbpAvailable.minus(userBalance.sbpForSale);
    if (nonSaleAvailable.lt(amount)) {
      return res.status(400).json({ error: "Saldo SBP tidak mencukupi (karena sebagian dijual)." });
    }

    const totalUserStake = new Decimal(await UserStaking.sum("amount", {
      where: { userId, unstakeTime: null },
    }) || 0);

    if (config.maxStakePerUser && totalUserStake.plus(amount).gt(config.maxStakePerUser)) {
      return res.status(400).json({ error: "Melebihi batas staking per user." });
    }

    const totalGlobalStake = new Decimal(await UserStaking.sum("amount", {
      where: { unstakeTime: null },
    }) || 0);

    if (config.maxTotalStaked && totalGlobalStake.plus(amount).gt(config.maxTotalStaked)) {
      return res.status(400).json({ error: "Staking global penuh." });
    }

    userBalance.sbp = userBalance.sbp.minus(amount);
    userBalance.sbpAvailable = userBalance.sbpAvailable.minus(amount);
    await userBalance.save();

    await UserStaking.create({
      userId,
      amount: amount.toFixed(),
      stakeTime: new Date(),
      lastRewardClaimedAt: new Date(),
    });

    res.json({ message: `✅ Staking sebesar ${amount.toFixed()} SBP berhasil.` });
  } catch (err) {
    console.error("❌ stakeSbp error:", err);
    res.status(500).json({ error: "Gagal staking SBP" });
  }
};

// 🔹 Claim Reward Only
exports.claimStakingReward = async (req, res) => {
  try {
    const userId = req.user.id;
    const config = await StakingConfig.findOne();
    const now = new Date();

    const staking = await UserStaking.findOne({ where: { userId, unstakeTime: null } });
    if (!staking) return res.status(400).json({ error: "Tidak ada staking aktif." });

    const last = new Date(staking.lastRewardClaimedAt);
    const days = Math.floor((now - last) / (1000 * 60 * 60 * 24));
    if (days <= 0) return res.status(400).json({ error: "Belum cukup 1 hari untuk klaim reward." });

    const reward = staking.amount
      .mul(config.dailyRewardPercent)
      .div(100)
      .mul(days)
      .toDecimalPlaces(18);

    const alloc = await SbpAllocationBalance.findOne({ where: { category: "StakingAndReward" } });
    if (!alloc || new Decimal(alloc.amount).lt(reward)) {
      return res.status(500).json({ error: "Alokasi SBP untuk reward tidak mencukupi." });
    }

    const userBalance = await UserBalance.findOne({ where: { userId } });

    // Transfer reward
    userBalance.sbp = userBalance.sbp.plus(reward);
    userBalance.sbpAvailable = userBalance.sbpAvailable.plus(reward);
    await userBalance.save();

    await SbpBalanceDetail.create({
      userId,
      source: "staking-reward",
      amount: reward.toFixed(),
      lockedUntil: null,
    });

    alloc.amount = new Decimal(alloc.amount).minus(reward).toFixed();
    await alloc.save();

    const pool = await SbpPool.findOne({ where: { id: 1 } });
    pool.staked = new Decimal(pool.staked).plus(reward).toFixed();
    await pool.save();

    await SbpTokenHistory.create({
      type: "staking",
      staked: reward.toFixed(),
      totalSupply: new Decimal(pool.totalMinted).minus(pool.totalBurned).toFixed(),
      note: `Reward staking ${reward.toFixed()} SBP untuk user #${userId}`,
    });

    staking.lastRewardClaimedAt = now;
    await staking.save();

    res.json({ message: `✅ Klaim reward berhasil: ${reward.toFixed()} SBP.` });
  } catch (err) {
    console.error("❌ claimStakingReward error:", err);
    res.status(500).json({ error: "Gagal klaim reward staking." });
  }
};

// 🔹 Compound Reward ke Staking
exports.compoundStakingReward = async (req, res) => {
  try {
    const userId = req.user.id;
    const config = await StakingConfig.findOne();
    const now = new Date();

    const staking = await UserStaking.findOne({ where: { userId, unstakeTime: null } });
    if (!staking) return res.status(400).json({ error: "Tidak ada staking aktif." });

    const last = new Date(staking.lastRewardClaimedAt);
    const days = Math.floor((now - last) / (1000 * 60 * 60 * 24));
    if (days <= 0) return res.status(400).json({ error: "Belum cukup 1 hari untuk compound." });

    const reward = staking.amount
      .mul(config.dailyRewardPercent)
      .div(100)
      .mul(days)
      .toDecimalPlaces(18);

    const alloc = await SbpAllocationBalance.findOne({ where: { category: "StakingAndReward" } });
    if (!alloc || new Decimal(alloc.amount).lt(reward)) {
      return res.status(500).json({ error: "Alokasi SBP untuk reward tidak mencukupi." });
    }

    alloc.amount = new Decimal(alloc.amount).minus(reward).toFixed();
    await alloc.save();

    staking.amount = staking.amount.plus(reward);
    staking.lastRewardClaimedAt = now;
    await staking.save();

    const pool = await SbpPool.findOne({ where: { id: 1 } });
    pool.staked = new Decimal(pool.staked).plus(reward).toFixed();
    await pool.save();

    await SbpTokenHistory.create({
      type: "staking",
      staked: reward.toFixed(),
      totalSupply: new Decimal(pool.totalMinted).minus(pool.totalBurned).toFixed(),
      note: `Compound reward ${reward.toFixed()} SBP ke staking user #${userId}`,
    });

    res.json({ message: `✅ Compound berhasil: ${reward.toFixed()} SBP.` });
  } catch (err) {
    console.error("❌ compoundStakingReward error:", err);
    res.status(500).json({ error: "Gagal compound reward." });
  }
};

// 🔹 Unstake & Auto Claim Reward
exports.unstakeAndClaim = async (req, res) => {
  try {
    const userId = req.user.id;
    const config = await StakingConfig.findOne();
    const now = new Date();

    const staking = await UserStaking.findOne({ where: { userId, unstakeTime: null } });
    if (!staking) return res.status(400).json({ error: "Tidak ada staking aktif." });

    const last = new Date(staking.lastRewardClaimedAt);
    const days = Math.floor((now - last) / (1000 * 60 * 60 * 24));

    const reward = staking.amount
      .mul(config.dailyRewardPercent)
      .div(100)
      .mul(days)
      .toDecimalPlaces(18);

    const userBalance = await UserBalance.findOne({ where: { userId } });

    if (reward.gt(0)) {
      const alloc = await SbpAllocationBalance.findOne({ where: { category: "StakingAndReward" } });
      if (!alloc || new Decimal(alloc.amount).lt(reward)) {
        return res.status(500).json({ error: "Alokasi reward tidak mencukupi." });
      }

      alloc.amount = new Decimal(alloc.amount).minus(reward).toFixed();
      await alloc.save();

      userBalance.sbp = userBalance.sbp.plus(reward);
      userBalance.sbpAvailable = userBalance.sbpAvailable.plus(reward);

      await SbpBalanceDetail.create({
        userId,
        source: "staking-reward",
        amount: reward.toFixed(),
        lockedUntil: null,
      });

      const pool = await SbpPool.findOne({ where: { id: 1 } });
      pool.staked = new Decimal(pool.staked).plus(reward).toFixed();
      await pool.save();

      await SbpTokenHistory.create({
        type: "staking",
        staked: reward.toFixed(),
        totalSupply: new Decimal(pool.totalMinted).minus(pool.totalBurned).toFixed(),
        note: `Reward staking ${reward.toFixed()} SBP (unstake) user #${userId}`,
      });
    }

    // Kembalikan pokok
    userBalance.sbp = userBalance.sbp.plus(staking.amount);
    userBalance.sbpAvailable = userBalance.sbpAvailable.plus(staking.amount);
    await userBalance.save();

    staking.unstakeTime = now;
    staking.rewardClaimed = true;
    await staking.save();

    res.json({
      message: `✅ Unstake berhasil. Pokok: ${staking.amount.toFixed()}, Reward: ${reward.toFixed()} SBP.`,
    });
  } catch (err) {
    console.error("❌ unstakeAndClaim error:", err);
    res.status(500).json({ error: "Gagal unstake SBP." });
  }
};

// 🔹 Riwayat Staking User
exports.getMyStakingStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const list = await UserStaking.findAll({
      where: { userId },
      order: [["stakeTime", "DESC"]],
    });
    res.json({ data: list });
  } catch (err) {
    console.error("❌ getMyStakingStatus error:", err);
    res.status(500).json({ error: "Gagal mengambil data staking." });
  }
};

// 🔹 Public Config
exports.getPublicStakingConfig = async (req, res) => {
  try {
    const config = await StakingConfig.findOne();
    if (!config) return res.status(500).json({ error: "Konfigurasi belum tersedia" });

    res.json({
      minStakeAmount: config.minStakeAmount.toString(),
      dailyRewardPercent: config.dailyRewardPercent.toString(),
      cycleDurationDays: config.cycleDurationDays,
    });
  } catch (err) {
    console.error("❌ getPublicStakingConfig error:", err);
    res.status(500).json({ error: "Gagal mengambil konfigurasi staking." });
  }
};

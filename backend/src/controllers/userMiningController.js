const { Op } = require("sequelize");
const Decimal = require("decimal.js");
const ReferralMiningLink = require("../models/ReferralMiningLink");
const MiningClickLog = require("../models/MiningClickLog");
const MiningRewardConfig = require("../models/MiningRewardConfig");
const UserBalance = require("../models/UserBalance");
const grantSbpWithSource = require("../utils/grantSbpWithSource");

exports.getMyMiningLink = async (req, res) => {
  try {
    const userId = req.user.id;
    let link = await ReferralMiningLink.findOne({ where: { userId } });
    if (!link) {
      const username = req.user.username || `user${userId}`;
      const uniqueCode = `${username.toLowerCase()}-mining`;
      link = await ReferralMiningLink.create({ userId, code: uniqueCode });
    }
    const baseUrl = process.env.BASE_URL || "";
    res.json({
      code: link.code,
      fullLink: `${baseUrl}/mining?ref=${link.code}`,
    });
  } catch (err) {
    console.error("Error getMyMiningLink:", err);
    res.status(500).json({ error: "Failed to get mining link." });
  }
};

exports.trackClick = async (req, res) => {
  try {
    const { ref } = req.body;
    const ip = req.ip;
    if (!ref) return res.status(400).json({ error: "Missing referral code." });
    const link = await ReferralMiningLink.findOne({ where: { code: ref } });
    if (!link) return res.status(404).json({ error: "Invalid referral code." });
    await MiningClickLog.create({ referralMiningLinkId: link.id, ip, isValid: false });
    res.json({ message: "Click tracked." });
  } catch (err) {
    console.error("Error trackClick:", err);
    res.status(500).json({ error: "Failed to track click." });
  }
};

exports.validateClick = async (req, res) => {
  try {
    const { ref } = req.body;
    const ip = req.ip;
    if (!ref) return res.status(400).json({ error: "Missing referral code." });
    const link = await ReferralMiningLink.findOne({ where: { code: ref } });
    if (!link) return res.status(404).json({ error: "Invalid referral code." });
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const existingValid = await MiningClickLog.findOne({
      where: {
        referralMiningLinkId: link.id,
        ip,
        isValid: true,
        createdAt: { [Op.gte]: today },
      },
    });
    if (existingValid) return res.json({ isValid: false, message: "Click already counted today." });
    const recentClick = await MiningClickLog.findOne({
      where: {
        referralMiningLinkId: link.id,
        ip,
        isValid: false,
        createdAt: { [Op.gte]: today },
      },
      order: [["createdAt", "DESC"]],
    });
    if (recentClick) {
      recentClick.isValid = true;
      await recentClick.save();
      return res.json({ isValid: true, message: "Click validated successfully." });
    }
    return res.status(404).json({ isValid: false, message: "No recent click found to validate." });
  } catch (err) {
    console.error("Error validateClick:", err);
    res.status(500).json({ error: "Failed to validate click." });
  }
};

exports.rewardPreview = async (req, res) => {
  try {
    const userId = req.user.id;
    const link = await ReferralMiningLink.findOne({ where: { userId } });
    if (!link) return res.status(404).json({ error: "You have no mining link." });
    const config = await MiningRewardConfig.findOne();
    if (!config) return res.status(500).json({ error: "Mining config not set." });
    const totalValidClicks = await MiningClickLog.count({
      where: { referralMiningLinkId: link.id, isValid: true },
    });
    const rewardGroups = Math.floor(totalValidClicks / config.sbpPerClickGroup);
    const rewards = {
      SBP: config.rewardType !== "TBP" ? new Decimal(config.sbpRewardAmount).mul(rewardGroups) : new Decimal(0),
      TBP: config.rewardType !== "SBP" ? new Decimal(config.tbpRewardAmount).mul(rewardGroups) : new Decimal(0),
    };
    res.json({ totalValidClicks, rewardGroups, rewards: {
      SBP: rewards.SBP.toString(),
      TBP: rewards.TBP.toString()
    }});
  } catch (err) {
    console.error("Error rewardPreview:", err);
    res.status(500).json({ error: "Failed to get reward preview." });
  }
};

exports.claimReward = async (req, res) => {
  try {
    const userId = req.user.id;
    const link = await ReferralMiningLink.findOne({ where: { userId } });
    if (!link) return res.status(404).json({ error: "You have no mining link." });
    const config = await MiningRewardConfig.findOne();
    if (!config) return res.status(500).json({ error: "Mining config not set." });
    const validClicks = await MiningClickLog.findAll({
      where: {
        referralMiningLinkId: link.id,
        isValid: true,
        claimed: false,
      },
    });
    const rewardGroups = Math.floor(validClicks.length / config.sbpPerClickGroup);
    if (rewardGroups === 0) {
      return res.status(400).json({ error: "Not enough valid clicks to claim rewards." });
    }
    const claimableClickIds = validClicks
      .slice(0, rewardGroups * config.sbpPerClickGroup)
      .map(c => c.id);
    await MiningClickLog.update(
      { claimed: true },
      { where: { id: { [Op.in]: claimableClickIds } } }
    );
    const rewards = {
      SBP: config.rewardType !== "TBP" ? new Decimal(config.sbpRewardAmount).mul(rewardGroups) : new Decimal(0),
      TBP: config.rewardType !== "SBP" ? new Decimal(config.tbpRewardAmount).mul(rewardGroups) : new Decimal(0),
    };
    let balance = await UserBalance.findOne({ where: { userId } });
    if (!balance) balance = await UserBalance.create({ userId });
    if (rewards.SBP.gt(0)) {
      await grantSbpWithSource(userId, rewards.SBP.toNumber(), "referral-mining", "StakingAndReward");
    }
    if (rewards.TBP.gt(0)) {
      balance.tbp = balance.tbp.plus(rewards.TBP);
    }
    await balance.save();
    res.json({
      message: "Reward claimed successfully.",
      rewardGroups,
      rewards: {
        SBP: rewards.SBP.toString(),
        TBP: rewards.TBP.toString()
      },
    });
  } catch (err) {
    console.error("Error claimReward:", err);
    res.status(500).json({ error: "Failed to claim reward." });
  }
};

exports.handleClick = async (req, res) => {
  try {
    const { ref, fingerprint } = req.body;
    const ip = req.ip;
    const userAgent = req.headers["user-agent"];
    if (!ref || !fingerprint) return res.status(400).json({ error: "Missing referral code or fingerprint." });
    const link = await ReferralMiningLink.findOne({ where: { code: ref } });
    if (!link) return res.status(404).json({ error: "Invalid referral code." });
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const existingValid = await MiningClickLog.findOne({
      where: {
        referralMiningLinkId: link.id,
        fingerprint,
        isValid: true,
        createdAt: { [Op.gte]: today },
      },
    });
    const isValid = !existingValid;
    await MiningClickLog.create({
      referralMiningLinkId: link.id,
      ip,
      fingerprint,
      userAgent,
      isValid,
    });
    res.json({
      isValid,
      message: isValid
        ? "Valid click recorded."
        : "Click recorded but not valid (already clicked today).",
    });
  } catch (err) {
    console.error("Error handleClick:", err);
    res.status(500).json({ error: "Failed to record click." });
  }
};

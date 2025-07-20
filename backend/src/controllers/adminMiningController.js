const { Op } = require("sequelize");
const Decimal = require("decimal.js");
const sequelize = require("../config/database");
const MiningRewardConfig = require("../models/MiningRewardConfig");
const ReferralMiningLink = require("../models/ReferralMiningLink");
const MiningClickLog = require("../models/MiningClickLog");
const User = require("../models/User");

// GET /admin/mining/config
async function getMiningConfig(req, res) {
  try {
    let config = await MiningRewardConfig.findOne();
    if (!config) {
      config = await MiningRewardConfig.create({});
    }

    // ✅ Convert Decimal to string for frontend
    res.json({
      sbpPerClickGroup: config.sbpPerClickGroup,
      sbpRewardAmount: config.sbpRewardAmount.toString(),
      tbpRewardAmount: config.tbpRewardAmount.toString(),
      rewardType: config.rewardType,
    });
  } catch (err) {
    console.error("❌ Error getMiningConfig:", err);
    res.status(500).json({ error: "Failed to fetch mining config." });
  }
}

// POST /admin/mining/config/update
async function updateMiningConfig(req, res) {
  try {
    const {
      sbpPerClickGroup,
      sbpRewardAmount,
      tbpRewardAmount,
      rewardType,
    } = req.body;

    // ✅ Validasi input
    if (
      isNaN(sbpPerClickGroup) ||
      !["SBP", "TBP", "BOTH"].includes(rewardType)
    ) {
      return res.status(400).json({ error: "Invalid input values." });
    }

    // ✅ Pastikan reward amount bisa dikonversi ke Decimal
    let sbpDecimal, tbpDecimal;
    try {
      sbpDecimal = new Decimal(sbpRewardAmount);
      tbpDecimal = new Decimal(tbpRewardAmount);
    } catch {
      return res.status(400).json({ error: "Invalid reward amount format." });
    }

    let config = await MiningRewardConfig.findOne();
    if (!config) {
      config = await MiningRewardConfig.create({
        sbpPerClickGroup,
        sbpRewardAmount: sbpDecimal.toString(),
        tbpRewardAmount: tbpDecimal.toString(),
        rewardType,
      });
    } else {
      config.sbpPerClickGroup = sbpPerClickGroup;
      config.sbpRewardAmount = sbpDecimal.toString();
      config.tbpRewardAmount = tbpDecimal.toString();
      config.rewardType = rewardType;
      await config.save();
    }

    res.json({ message: "Mining config updated successfully." });
  } catch (err) {
    console.error("❌ Error updateMiningConfig:", err);
    res.status(500).json({ error: "Failed to update mining config." });
  }
}

// GET /admin/mining/stats
const getAllMiningStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ✅ Total klik valid hari ini
    const totalValidClicksToday = await MiningClickLog.count({
      where: {
        isValid: true,
        createdAt: { [Op.gte]: today },
      },
    });

    // ✅ Ambil semua ReferralMiningLink dan eager load User
    const referralLinks = await ReferralMiningLink.findAll({
      include: [
        { model: User, as: "user", attributes: ["id", "username", "email"] },
        {
          model: MiningClickLog,
          as: "clickLogs",
          attributes: ["id"],
          where: { isValid: true },
          required: false,
        },
      ],
    });

    // ✅ Hitung klik valid manual
    const userClicks = referralLinks
      .map((link) => ({
        userId: link.userId,
        username: link.user?.username,
        email: link.user?.email,
        clickCount: link.clickLogs?.length || 0,
      }))
      .filter((u) => u.clickCount > 0)
      .sort((a, b) => b.clickCount - a.clickCount)
      .slice(0, 10);

    res.json({
      totalValidClicksToday,
      topUsers: userClicks,
    });
  } catch (err) {
    console.error("❌ getAllMiningStats error:", err);
    res.status(500).json({
      message: "Internal Server Error",
      detail: err.message,
    });
  }
};

// GET /admin/mining/logs/:userId
async function getUserMiningLog(req, res) {
  try {
    const userId = req.params.userId;

    const link = await ReferralMiningLink.findOne({ where: { userId } });
    if (!link) {
      return res.status(404).json({ error: "User has no mining link." });
    }

    const logs = await MiningClickLog.findAll({
      where: { referralMiningLinkId: link.id },
      order: [["createdAt", "DESC"]],
      limit: 100,
    });

    const validClickCount = logs.filter((log) => log.isValid).length;

    res.json({
      logs,
      totalValidClicks: validClickCount,
    });
  } catch (err) {
    console.error("❌ Error getUserMiningLog:", err);
    res.status(500).json({ error: "Failed to fetch mining logs." });
  }
}

// ✅ Export controller
module.exports = {
  getMiningConfig,
  updateMiningConfig,
  getAllMiningStats,
  getUserMiningLog,
};

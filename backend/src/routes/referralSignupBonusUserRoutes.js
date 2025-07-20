// ✅ apps/backend-api/src/routes/referralSignupBonusUserRoutes.js
const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { verifyToken } = require("../middlewares/authMiddleware");

const ReferralSignupBonusLog = require("../models/ReferralSignupBonusLog");

// ✅ GET /referral-signup/my-log-summary
// Untuk user: melihat total bonus dari downline yang berhasil daftar
router.get("/my-log-summary", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const logs = await ReferralSignupBonusLog.findAll({
      where: { uplineUserId: userId },
      order: [["createdAt", "DESC"]],
      raw: true,
    });

    const todayStr = new Date().toISOString().split("T")[0];

    const todayTotal = logs
      .filter((log) => log.createdAt.toISOString().startsWith(todayStr))
      .reduce((sum, log) => sum + parseFloat(log.amount), 0);

    const allTotal = logs.reduce((sum, log) => sum + parseFloat(log.amount), 0);

    res.json({
      totalDownlines: logs.length,
      totalToday: todayTotal,
      totalAllTime: allTotal,
    });
  } catch (err) {
    console.error("❌ Error my-log-summary:", err);
    res.status(500).json({ error: "Failed to fetch user bonus log" });
  }
});

module.exports = router;

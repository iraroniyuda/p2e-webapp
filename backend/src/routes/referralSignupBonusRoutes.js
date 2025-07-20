const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");

const ReferralSignupBonusConfig = require("../models/ReferralSignupBonusConfig");
const ReferralSignupBonusLog = require("../models/ReferralSignupBonusLog");
const User = require("../models/User");

const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

// Semua route ini hanya bisa diakses admin
router.use(verifyToken, verifyAdmin);

/**
 * ✅ GET /config
 * Ambil konfigurasi bonus referral signup
 */
router.get("/config", async (req, res) => {
  try {
    const config = await ReferralSignupBonusConfig.findOne();
    res.json(config || {});
  } catch (err) {
    console.error("❌ Error get config:", err);
    res.status(500).json({ error: "Failed to get config" });
  }
});

/**
 * ✅ POST /config/update
 * Simpan konfigurasi bonus referral signup
 */
router.post("/config/update", async (req, res) => {
  try {
    const {
      bonusPerSignup,
      maxDailyBonus,
      maxTotalBonus,
      isOpen,
    } = req.body;

    const [config] = await ReferralSignupBonusConfig.findOrCreate({ where: {} });

    config.bonusPerSignup = bonusPerSignup ?? config.bonusPerSignup;
    config.maxDailyBonus = maxDailyBonus || null;
    config.maxTotalBonus = maxTotalBonus || null;
    config.isOpen = typeof isOpen === "boolean" ? isOpen : false;

    await config.save();

    res.json({ message: "✅ Config updated", config });
  } catch (err) {
    console.error("❌ Error update config:", err);
    res.status(500).json({ error: "Failed to update config" });
  }
});

/**
 * ✅ GET /logs?uplineUserId=xxx
 * Lihat log pemberian bonus signup
 */
router.get("/logs", async (req, res) => {
  try {
    const { uplineUserId } = req.query;
    const whereClause = uplineUserId ? { uplineUserId } : {};

    const logs = await ReferralSignupBonusLog.findAll({
      where: whereClause,
      include: [
        { model: User, as: "upline", attributes: ["id", "username"] },
        { model: User, as: "downline", attributes: ["id", "username"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(logs);
  } catch (err) {
    console.error("❌ Error fetching logs:", err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

module.exports = router;

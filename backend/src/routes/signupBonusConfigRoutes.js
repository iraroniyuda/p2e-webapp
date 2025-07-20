const express = require("express");
const router = express.Router();
const SignupBonusConfig = require("../models/SignupBonusConfig");
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

// Semua route hanya bisa diakses oleh admin
router.use(verifyToken, verifyAdmin);

/**
 * ✅ GET /config
 * Ambil konfigurasi bonus signup
 */
router.get("/config", async (req, res) => {
  try {
    const config = await SignupBonusConfig.findOne({ order: [["createdAt", "DESC"]] });
    res.json(config || {});
  } catch (err) {
    console.error("❌ Error get signup bonus config:", err);
    res.status(500).json({ error: "Failed to get config" });
  }
});

/**
 * ✅ POST /config/update
 * Simpan / update konfigurasi bonus signup
 */
router.post("/config/update", async (req, res) => {
  try {
    const { sbpAmount } = req.body;

    if (!sbpAmount || isNaN(sbpAmount)) {
      return res.status(400).json({ error: "❌ Invalid sbpAmount" });
    }

    const [config] = await SignupBonusConfig.findOrCreate({ where: {} });

    config.sbpAmount = sbpAmount.toString();
    await config.save();

    res.json({ message: "✅ Signup bonus config updated", config });
  } catch (err) {
    console.error("❌ Error updating signup bonus config:", err);
    res.status(500).json({ error: "Failed to update config" });
  }
});

module.exports = router;

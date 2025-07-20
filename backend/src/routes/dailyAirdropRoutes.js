const express = require("express");
const router = express.Router();

const {
  getDailyAirdropConfig,
  updateDailyAirdropConfig,
  getDailyAirdropStatus,   // ✅ Ganti dari typo 'etDailyAirdropStatus'
  claimDailyAirdrop,
} = require("../controllers/dailyAirdropController");

const { verifyAdmin, verifyToken } = require("../middlewares/authMiddleware");

// 🔐 Admin endpoints
router.get("/admin/config", verifyToken, verifyAdmin, getDailyAirdropConfig);
router.post("/admin/config/update", verifyToken, verifyAdmin, updateDailyAirdropConfig);

// 👤 User endpoints
router.get("/status", verifyToken, getDailyAirdropStatus);      
router.post("/claim", verifyToken, claimDailyAirdrop);          

module.exports = router;

const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

const {
  getMiningConfig,
  updateMiningConfig,
  getAllMiningStats,
  getUserMiningLog,
} = require("../controllers/adminMiningController");

// Konfigurasi reward mining
router.get("/config", verifyToken, verifyAdmin, getMiningConfig);
router.post("/config/update", verifyToken, verifyAdmin, updateMiningConfig);

// Monitoring
router.get("/stats", verifyToken, verifyAdmin , getAllMiningStats);
router.get("/logs/:userId", verifyToken, verifyAdmin , getUserMiningLog);

module.exports = router;

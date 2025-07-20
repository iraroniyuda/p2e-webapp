// 📁 routes/upgradePriceConfigRoutes.js
const express = require("express");
const router = express.Router();
const { getAllConfigs, setPriceConfig } = require("../controllers/upgradePriceConfigController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/game/config/upgrade-price", verifyToken, getAllConfigs);
router.post("/game/config/upgrade-price", verifyToken, setPriceConfig);

module.exports = router;
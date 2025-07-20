const express = require("express");
const router = express.Router();
const { getAllAdminAssets, updateAssetPrice, updateUpgradeFlatPriceConfig, getAllUpgradeFlatPriceConfigs } = require("../controllers/adminCarPriceController.js");
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

// GET: semua asset
router.get("/assets",verifyToken, verifyAdmin, getAllAdminAssets);

// POST: update harga
router.post("/assets/:id/price",verifyToken, verifyAdmin, updateAssetPrice);

router.post("/upgrade-price-configs/:partType",verifyToken, verifyAdmin, updateUpgradeFlatPriceConfig);

router.get("/upgrade-price-configs",verifyToken, verifyAdmin, getAllUpgradeFlatPriceConfigs);

module.exports = router;

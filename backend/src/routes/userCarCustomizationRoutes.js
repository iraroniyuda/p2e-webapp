const express = require("express");
const router = express.Router();

const {
  getCustomization,
  purchaseCar,
  purchaseCustomizationPart,
  getUnlockedCustomizationParts,
  saveCustomization,
  upgradeCarPart,
  getUpgradeLevel,
  reduceDurabilityBatch,
  setSelectedCar,
  getSelectedCar,
  getDurabilityList,
  getOwnedPartLevel
} = require("../controllers/userCarCustomizationController");

const { verifyToken } = require("../middlewares/authMiddleware");
const UpgradeFlatPriceConfig = require("../models/UpgradeFlatPriceConfig");

router.get("/game/garage/customization/:assetId", verifyToken, getCustomization);
router.post("/game/garage/customization/save", verifyToken, saveCustomization);
router.post("/game/customization/selected-car", verifyToken, setSelectedCar);
router.get("/game/customization/selected-car", verifyToken, getSelectedCar);

router.post("/game/purchase/car", verifyToken, purchaseCar);
router.post("/game/purchase/customization", verifyToken, purchaseCustomizationPart);
router.get("/game/purchase/customization/unlocked/:assetId", verifyToken, getUnlockedCustomizationParts);

router.post("/game/purchase/upgrade", verifyToken, upgradeCarPart);
router.get("/game/customization/upgrade-level", verifyToken, getUpgradeLevel);
router.post("/game/customization/reduce-durability-batch", verifyToken, reduceDurabilityBatch);
router.get("/game/customization/durability", verifyToken, getDurabilityList);
router.get("/game/customization/owned-part-level", verifyToken, getOwnedPartLevel);
// 🌐 Public route for flat upgrade prices (no auth needed)
router.get("/game/config/upgrade", async (req, res) => {
  try {
    const configs = await UpgradeFlatPriceConfig.findAll();
    res.json(configs);
  } catch (err) {
    console.error("❌ Gagal ambil harga upgrade:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");

const {
  purchaseCar,
  purchaseCustomizationPart,
  getCustomization,
  getUnlockedCustomizationParts,  // 🆕 Tambahan
  upgradePart
} = require("../controllers/gamePurchaseController");

// ✅ Sesuai dengan /api/game/purchase/xxx

router.post("/car", verifyToken, purchaseCar);
router.post("/customization", verifyToken, purchaseCustomizationPart);
router.get("/customization/:assetId", verifyToken, getCustomization);

// 🆕 Endpoint untuk ambil daftar part yang dimiliki
router.get("/customization/unlocked/:assetId", verifyToken, getUnlockedCustomizationParts);

module.exports = router;

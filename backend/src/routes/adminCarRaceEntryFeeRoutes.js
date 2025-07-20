const express = require("express");
const router = express.Router();

const {
  getAllEntryFeeConfigs,
  getEntryFeeByAssetId,
  setEntryFee,
} = require("../controllers/adminCarRaceEntryFeeController.js");

const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware.js");

// 🏁 Entry Fee Config
router.get("/", verifyToken, verifyAdmin, getAllEntryFeeConfigs);
router.get("/:assetId", verifyToken, verifyAdmin, getEntryFeeByAssetId);
router.post("/", verifyToken, verifyAdmin, setEntryFee);

module.exports = router;

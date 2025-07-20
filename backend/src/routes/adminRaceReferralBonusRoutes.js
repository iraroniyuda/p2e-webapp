const express = require("express");
const router = express.Router();
const {
  getAllReferralBonusConfigs,
  updateReferralBonusConfig,
} = require("../controllers/adminRaceReferralBonusController");
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");


// Semua route ini hanya bisa diakses admin
router.use(verifyToken, verifyAdmin);

router.get("/referral-bonus", getAllReferralBonusConfigs);
router.post("/referral-bonus/:id", updateReferralBonusConfig);

module.exports = router;

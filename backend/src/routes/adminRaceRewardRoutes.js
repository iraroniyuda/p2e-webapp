const express = require("express");
const router = express.Router();
const {
  getAllCarRaceRewards,
  updateCarRaceReward,
} = require("../controllers/adminCarRaceRewardController");
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");


// Semua route ini hanya bisa diakses admin
router.use(verifyToken, verifyAdmin);

// (GET) Semua reward
router.get("/car-race-reward-configs",  getAllCarRaceRewards);

// (POST/PUT) Upsert reward per mobil
router.post("/car-race-reward-configs", updateCarRaceReward);

module.exports = router;

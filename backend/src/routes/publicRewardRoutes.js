// routes/publicRewardRoutes.js
const express = require("express");
const router = express.Router();
const { getAllCarRaceRewards } = require("../controllers/adminCarRaceRewardController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/public-car-race-reward-configs", verifyToken, getAllCarRaceRewards);  // untuk semua user yang login

module.exports = router;

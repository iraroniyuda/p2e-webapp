const express = require("express");
const router = express.Router();
const { submitRaceResult, startRaceSession, getUserRaceWinCounter } = require("../controllers/raceResultController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Submit hasil balapan
router.post("/race-result", verifyToken, submitRaceResult);
router.post("/start", verifyToken, startRaceSession);
router.get("/wincounter", verifyToken, getUserRaceWinCounter);

module.exports = router;

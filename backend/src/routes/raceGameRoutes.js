const express = require("express");
const router = express.Router();
const { getRaceBalance } = require("../controllers/raceGameController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/balance/race", verifyToken, getRaceBalance);

module.exports = router;

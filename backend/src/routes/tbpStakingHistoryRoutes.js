const express = require("express");
const router = express.Router();
const { createTbpStakingHistory } = require("../controllers/tbpStakingHistoryController");
const { verifyToken} = require("../middlewares/authMiddleware");

router.post("/history", verifyToken, createTbpStakingHistory);

module.exports = router;

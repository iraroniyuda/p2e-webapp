const express = require('express');
const router = express.Router();
const {
  getStakingConfig,
} = require("../controllers/tokenController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Route publik untuk user ambil config staking
router.get("/staking-config", verifyToken, getStakingConfig);

// Route lain yang memang public bisa ditambahkan di sini

module.exports = router;

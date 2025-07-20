// routes/userTbpBurnRateConfigRoutes.js
const express = require("express");
const router = express.Router();
const { getTbpBurnRate } = require("../controllers/userTbpBurnRateController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/tbp-burn-rate", verifyToken, getTbpBurnRate);

module.exports = router;

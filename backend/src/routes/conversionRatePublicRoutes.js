const express = require("express");
const router = express.Router();
const { getCurrentConversionRate } = require("../controllers/conversionRateController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/conversion-rate/sbp-to-tbp", verifyToken, getCurrentConversionRate);

module.exports = router;

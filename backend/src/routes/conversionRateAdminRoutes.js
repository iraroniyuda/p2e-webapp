const express = require("express");
const router = express.Router();
const { setConversionRate } = require("../controllers/conversionRateController");
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

router.post("/conversion-rate/sbp-to-tbp", verifyToken, verifyAdmin, setConversionRate);


module.exports = router;

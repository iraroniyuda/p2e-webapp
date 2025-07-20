const express = require("express");
const router = express.Router();
const {
    getAllRates,
    setRate
} = require("../controllers/tbpExchangeRateController");
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

// Semua route ini hanya bisa diakses admin
router.use(verifyToken, verifyAdmin);

router.get("/", getAllRates);
router.post("/set", setRate);

module.exports = router;

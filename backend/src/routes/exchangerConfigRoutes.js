// src/routes/adminExchangerConfigRoutes.js
const express = require("express");
const router = express.Router();
const { getExchangerConfig, updateExchangerConfig } = require("../controllers/exchangerConfigController");
const { verifyAdmin, verifyToken } = require("../middlewares/authMiddleware");

router.get("/", verifyAdmin, verifyToken, getExchangerConfig);
router.post("/update", verifyAdmin, verifyToken, updateExchangerConfig);

module.exports = router;
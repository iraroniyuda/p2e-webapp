const express = require("express");
const router = express.Router();
const {
  getExchangerConfig,
  updateExchangerConfig,
} = require("../controllers/adminExchangerConfigController");

const { verifyAdmin, verifyToken } = require("../middlewares/authMiddleware");

router.get("/", verifyToken, verifyAdmin, getExchangerConfig);
router.post("/update", verifyToken, verifyAdmin, updateExchangerConfig);

module.exports = router;

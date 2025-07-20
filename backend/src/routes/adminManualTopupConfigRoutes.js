const express = require("express");
const router = express.Router();

const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware"); // ✅ middleware autentikasi

const {
  getAllManualTopupConfigs,
  updateManualTopupConfig,
} = require("../controllers/adminManualTopupConfigController");

// ✅ Route GET dan PUT untuk konfigurasi top-up manual
router.get("/manual-config", verifyToken, verifyAdmin, getAllManualTopupConfigs);
router.put("/manual-config/:id", verifyToken, verifyAdmin, updateManualTopupConfig);


module.exports = router;

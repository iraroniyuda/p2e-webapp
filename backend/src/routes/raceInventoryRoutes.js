const express = require("express");
const router = express.Router();

const { getUserInventory } = require("../controllers/raceInventoryController");
const { getAllAssets } = require("../controllers/raceAssetController");
const { verifyToken } = require("../middlewares/authMiddleware");

// 🏎️ Inventaris mobil user (butuh login)
router.get("/inventory/race", verifyToken, getUserInventory);

// 🏪 Daftar mobil tersedia di toko (publik)
router.get("/assets", getAllAssets);

module.exports = router;

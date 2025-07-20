const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const { buyCircuitOwnerPackage } = require("../controllers/circuitOwnerPackageController");
const { getAllCircuitOwnerPackages } = require("../controllers/circuitOwnerPackageController");

// Endpoint: Beli paket circuit owner
router.post("/buy", verifyToken, buyCircuitOwnerPackage);
router.get("/", getAllCircuitOwnerPackages);

module.exports = router;

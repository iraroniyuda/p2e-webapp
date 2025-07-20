const express = require("express");
const router = express.Router();
const { listPackages, updatePackage } = require("../controllers/adminCircuitPackageController");
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

router.get("/", verifyToken, verifyAdmin, listPackages);
router.post("/:id", verifyToken, verifyAdmin, updatePackage);

module.exports = router;

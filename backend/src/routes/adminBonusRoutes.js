const express = require("express");
const router = express.Router();

const {
  getAllBonusConfigs,
  createBonusConfig,
  updateBonusConfig,
  deleteBonusConfig,
} = require("../controllers/adminBonusController");

const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

// Semua route ini hanya bisa diakses admin
router.use(verifyToken, verifyAdmin);

router.get("/", getAllBonusConfigs);
router.post("/", createBonusConfig);
router.put("/:id", updateBonusConfig);
router.delete("/:id", deleteBonusConfig);

module.exports = router;

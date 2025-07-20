const express = require("express");
const router = express.Router();

const {
  getAllWithdrawConfigs,
  createWithdrawConfig,
  updateWithdrawConfig,
  deleteWithdrawConfig,
} = require("../controllers/adminWithdrawConfigController");

const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

// Hanya admin
router.use(verifyToken, verifyAdmin);

router.get("/", getAllWithdrawConfigs);
router.post("/", createWithdrawConfig);

// Update (ganti dari PUT jadi POST)
router.post("/update/:id", updateWithdrawConfig);

// Delete (ganti dari DELETE jadi POST)
router.post("/delete/:id", deleteWithdrawConfig);

module.exports = router;

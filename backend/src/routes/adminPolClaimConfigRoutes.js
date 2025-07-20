const express = require("express");
const router = express.Router();
const {
  updatePolClaimConfig,
  listPolClaimConfig,
} = require("../controllers/polClaimConfigController");
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');

// List semua config POL (GET)
router.get("/list", verifyToken, verifyAdmin, listPolClaimConfig);

router.post("/update", verifyToken, verifyAdmin, updatePolClaimConfig);

module.exports = router;

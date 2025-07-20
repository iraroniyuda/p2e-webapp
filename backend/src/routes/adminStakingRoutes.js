// routes/adminStakingRoutes.js
const express = require("express");
const router = express.Router();
const { getStakingConfig, updateStakingConfig } = require("../controllers/adminStakingController");
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

router.use(verifyToken, verifyAdmin);
router.get("/", getStakingConfig);
router.post("/update", updateStakingConfig);

module.exports = router;

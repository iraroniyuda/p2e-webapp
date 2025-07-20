const express = require("express");
const router = express.Router();
const { getUserActivationProgress, activateUserAccount } = require("../controllers/activationController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/user/activation-progress", verifyToken, getUserActivationProgress);
router.post("/activate-account", verifyToken, activateUserAccount);

module.exports = router;

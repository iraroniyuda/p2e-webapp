// src/routes/manualTopupPublicRoutes.js
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");

const {
  getManualTopupRulePublic,
} = require("../controllers/manualTopupPublicController");

router.get("/manual-topup/rule", verifyToken, getManualTopupRulePublic);

module.exports = router;

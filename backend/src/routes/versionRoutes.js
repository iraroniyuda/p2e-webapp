// apps/backend-api/src/routes/versionRoutes.js
const express = require("express");
const router = express.Router();
const { checkVersion } = require("../controllers/versionController");

// Versi khusus untuk game TBP Race
router.get("/race", checkVersion);

module.exports = router;

const express = require("express");
const router = express.Router();

const {
  getPublicCarRaceEntryFees,
} = require("../controllers/publicGameController.js");

// Route untuk public fetch entry fee
router.get("/public-car-race-entry-fees", getPublicCarRaceEntryFees);

module.exports = router;

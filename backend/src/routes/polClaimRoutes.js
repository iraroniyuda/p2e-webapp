const express = require("express");
const router = express.Router();
const { claimPol, getPolClaimEligibility, getPolClaimHistory } = require("../controllers/polClaimController");
const { verifyToken } = require('../middlewares/authMiddleware');

router.post("/claim-pol", verifyToken, claimPol);
router.get("/claim-pol/eligibility", verifyToken, getPolClaimEligibility);
router.get("/claim-pol/history", verifyToken, getPolClaimHistory);
module.exports = router;

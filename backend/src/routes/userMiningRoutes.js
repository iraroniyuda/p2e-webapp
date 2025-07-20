const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const { miningLimiter } = require("../middlewares/rateLimit");

const {
  getMyMiningLink,
  trackClick,
  validateClick,
  rewardPreview,
  claimReward,
  handleClick,
} = require("../controllers/userMiningController");

router.get("/my-link", verifyToken, getMyMiningLink);
router.post("/track", miningLimiter, trackClick);
router.post("/validate", miningLimiter, validateClick);
router.get("/reward-preview", verifyToken, rewardPreview);
router.post("/claim-reward", verifyToken, claimReward);
router.post("/click", miningLimiter, handleClick);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  stakeSbp,
  unstakeAndClaim,
  claimStakingReward,
  compoundStakingReward,
  getMyStakingStatus,
  getPublicStakingConfig,
} = require("../controllers/userStakingController");

const { verifyToken } = require("../middlewares/authMiddleware");
const { requireKycApproved } = require("../middlewares/kycMiddleware");

// Semua route staking membutuhkan login dan KYC approval
router.use(verifyToken, requireKycApproved);

// 🔹 Staking utama
router.post("/stake", stakeSbp);
router.post("/unstake-and-claim", unstakeAndClaim);

// 🔹 Aksi reward
router.post("/claim", claimStakingReward);
router.post("/compound", compoundStakingReward);

// 🔹 Data & status
router.get("/my-staking", getMyStakingStatus);
router.get("/config", getPublicStakingConfig);

module.exports = router;

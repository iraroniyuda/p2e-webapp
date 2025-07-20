const express = require("express");
const router = express.Router();
const {
  mintTbp,
  transferTbp,
  burnTbp,
  lockP2P,
  unlockP2P,
  transferOwnership,
  setRewardRate,
  setMinimumStakeTime,
  setStakingCap,
  getStakingConfig,
  getTotalSupply,
  getTokenBalance,
  getP2PAllowedStatus,
  getTokenInfo
} = require("../controllers/tokenController");

const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

// ✅ Proteksi semua route di bawah hanya untuk admin
router.use(verifyToken, verifyAdmin);

// 🪙 Token Management
router.post("/mint", mintTbp);
router.post("/transfer", transferTbp);
router.post("/burn", burnTbp);

// 🔒 P2P Lock Control
router.post("/lock-p2p", lockP2P);
router.post("/unlock-p2p", unlockP2P);

// ⚠️ Ownership
router.post("/transfer-ownership", transferOwnership);

// ⚙️ Staking Config (setter)
router.post("/set-reward-rate", setRewardRate);
router.post("/set-min-stake-time", setMinimumStakeTime);
router.post("/set-stake-cap", setStakingCap);

router.get("/staking-config", getStakingConfig);

router.get("/total-supply", getTotalSupply);
router.get("/balance", getTokenBalance);        
router.get("/p2p-status", getP2PAllowedStatus); 
router.get("/info", getTokenInfo);

module.exports = router;

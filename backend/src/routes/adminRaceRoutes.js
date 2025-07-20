const express = require("express");
const router = express.Router();
const {
  listRaceUsers,
  transferRaceToUser,
  getRaceTransactionHistory,
} = require("../controllers/adminRaceController");
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

router.use(verifyToken, verifyAdmin);
router.get("/users", listRaceUsers);
router.post("/transfer", transferRaceToUser);
router.get("/history", getRaceTransactionHistory);

module.exports = router;

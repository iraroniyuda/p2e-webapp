const express = require("express");
const router = express.Router();
const { getAllPolClaimHistories } = require("../controllers/adminPolClaimHistoryController");


const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

router.use(verifyToken, verifyAdmin);
router.get("/", getAllPolClaimHistories);

module.exports = router;

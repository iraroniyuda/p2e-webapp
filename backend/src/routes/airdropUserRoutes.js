const express = require("express");
const router = express.Router();
const { listActiveAirdrops, joinAirdrop } = require("../controllers/airdropUserController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.use(verifyToken);

router.get("/active", listActiveAirdrops);
router.post("/:id/join", joinAirdrop);

module.exports = router;

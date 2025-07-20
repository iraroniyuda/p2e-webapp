const express = require("express");
const router = express.Router();
const {
  getExchangerUsers,
  getCompanyExchangers,
  assignCompanyExchanger,
} = require("../controllers/adminExchangerController");
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

router.get("/users", verifyToken, verifyAdmin, getExchangerUsers);
router.get("/", verifyToken, verifyAdmin, getCompanyExchangers);
router.post("/assign", verifyToken, verifyAdmin, assignCompanyExchanger);

module.exports = router;

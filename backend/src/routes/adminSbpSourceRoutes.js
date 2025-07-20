const express = require("express");
const router = express.Router();
const {
  getAllSourceRules,
  createSourceRule,
  updateSourceRule,
  deleteSourceRule,
} = require("../controllers/adminSbpSourceController");

const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

router.use(verifyToken, verifyAdmin);
router.get("/", getAllSourceRules);
router.post("/", createSourceRule);
router.put("/:id", updateSourceRule);
router.delete("/:id", deleteSourceRule);

module.exports = router;

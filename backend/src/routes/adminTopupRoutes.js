const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");
const {
  getTopupPackages,
  updateTopupPackage,
  getTopupTransactionTypes,

} = require("../controllers/adminTopupPackageController");
const { fixPreview, fixApply } = require("../controllers/adminFixTransactionController");

router.get("/topup-packages", verifyToken, verifyAdmin, getTopupPackages);
router.put("/topup-packages/:id", verifyToken, verifyAdmin, updateTopupPackage);
router.get("/topup-transactions", verifyToken, verifyAdmin, getTopupTransactionTypes);

router.get("/fix-applied-preview", verifyToken, verifyAdmin, fixPreview);
router.post("/fix-applied-execute", verifyToken, verifyAdmin, fixApply);

module.exports = router;

const express = require("express");
const router = express.Router();

const {

  transferSbpToUser,
  listSbpUsers,
  getAllUsers,
  getSbpSettings,
  updateSbpPrice,
  mintSbp,
  burnSbp,
  getSbpHistory,
  getAllocationSummary,
  transferAllocationAmount,
  getAllocationCategories,
  deductSbpFromUser,
  getTotalSbpMined,
} = require("../controllers/adminSbpController");

const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");


// Semua route ini hanya bisa diakses admin
router.use(verifyToken, verifyAdmin);
router.get("/settings", getSbpSettings);
router.post("/update-price", updateSbpPrice);
router.post("/mint", mintSbp);
router.post("/burn", burnSbp);
router.get("/users", listSbpUsers);
router.post("/transfer", transferSbpToUser);
router.post("/deduct", deductSbpFromUser);
router.get("/all-users", getAllUsers);
router.get("/history", getSbpHistory);
router.post("/allocate-transfer", transferAllocationAmount);
router.get("/allocation-categories", getAllocationCategories);
router.get("/allocation-summary", getAllocationSummary);
router.get("/total-mined", getTotalSbpMined);



module.exports = router;

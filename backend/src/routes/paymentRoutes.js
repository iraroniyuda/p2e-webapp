const express = require('express');
const router = express.Router();
const { 
  userTopUp, 
  getUserTransactions, 
  userTopUpManual, 
  userTopUpPackage, 
  checkVAStatus, 
  getSuccessfulTransactionsSummary,
  getTopupPackages,
  generateQrisTopup,
} = require('../controllers/transactionController');

const { 
  userWithdrawInquiry,
  userWithdrawExecute,
  getWithdrawHistory, 
  checkWithdrawStatus // ✅ Tambahan
} = require("../controllers/withdrawController");

const { verifyToken } = require('../middlewares/authMiddleware');
const { requireKycApproved } = require('../middlewares/kycMiddleware');

// ✅ Route: User Top-Up (protected with JWT)
router.post('/user/topup', verifyToken, requireKycApproved, userTopUp);
router.get('/user/transactions', verifyToken, requireKycApproved, getUserTransactions);
router.post('/user/topup/manual', verifyToken, requireKycApproved, userTopUpManual);
router.post('/user/topup/package', verifyToken, requireKycApproved, userTopUpPackage);

router.get('/user/check-va-status', verifyToken, requireKycApproved, checkVAStatus);
router.get('/user/transactions/success-summary', verifyToken, getSuccessfulTransactionsSummary);

// 🔹 Withdraw: Inquiry → hanya cek bank & simpan transaksi
router.post("/user/withdraw/inquiry", verifyToken, requireKycApproved, userWithdrawInquiry);

// 🔹 Withdraw: Eksekusi → proses dan potong saldo
router.post("/user/withdraw/execute", verifyToken, requireKycApproved, userWithdrawExecute);



// ✅ Route baru: Cek status withdraw
router.get("/user/withdraw/check-status", verifyToken, requireKycApproved, checkWithdrawStatus);
router.get("/user/withdraw-history", verifyToken, requireKycApproved, getWithdrawHistory);


router.get("/packages", getTopupPackages);
router.post("/user/topup/qris", verifyToken, requireKycApproved, generateQrisTopup);

module.exports = router;

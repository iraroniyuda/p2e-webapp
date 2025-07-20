const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');
const { adminWithdrawInquiry, adminWithdrawExecute } = require('../controllers/adminWithdrawController');

router.post('/withdraw/inquiry', verifyToken, verifyAdmin, adminWithdrawInquiry);
router.post('/withdraw/execute', verifyToken, verifyAdmin, adminWithdrawExecute);

module.exports = router;

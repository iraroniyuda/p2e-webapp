const express = require('express');
const { getAllWithdrawalHistory } = require('../controllers/adminWithdrawalHistoryController');
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.use(verifyToken, verifyAdmin);
router.get('/withdrawal-history', getAllWithdrawalHistory);

module.exports = router;

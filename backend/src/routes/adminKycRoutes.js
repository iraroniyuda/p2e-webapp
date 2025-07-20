const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const UserKycRequest = require('../models/UserKycRequest');
const User = require('../models/User');

// 🔍 GET semua request KYC (admin only)
router.get('/', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const requests = await UserKycRequest.findAll({
      include: [{ model: User, as: 'user', attributes: ['username', 'email'] }],
      order: [['submitted_at', 'DESC']],
    });
    res.json(requests);
  } catch (err) {
    console.error("❌ Admin KYC Fetch Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ POST /api/admin/kyc/:id/approve
router.post('/:id/approve', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const requestId = req.params.id;

    const kyc = await UserKycRequest.findOne({ where: { id: requestId } });
    if (!kyc) return res.status(404).json({ error: "KYC request not found." });

    await kyc.update({
      status: 'APPROVED',
      reviewedAt: new Date(),
      reviewedByAdminId: req.user.id,
    });

    const clean = (v) => {
      if (typeof v === "string") v = v.trim();
      return !v ? null : v;
    };

    const updates = {};
    if (clean(kyc.walletAddress)) updates.wallet = clean(kyc.walletAddress);
    if (clean(kyc.bankAccountNumber)) updates.bankAccountNumber = clean(kyc.bankAccountNumber);

    if (Object.keys(updates).length > 0) {
      await User.update(updates, { where: { id: kyc.userId } });
    }

    return res.json({ message: "✅ KYC approved and user updated" });
  } catch (err) {
    console.error("❌ Approve KYC Error:", err);
    res.status(500).json({ error: "Failed to approve KYC" });
  }
});



// ✅ POST /api/admin/kyc/:id/reject
router.post('/:id/reject', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const requestId = req.params.id;
    const { reason } = req.body;

    await UserKycRequest.update({
      status: 'REJECTED',
      reason_rejected: reason,
      reviewed_at: new Date(),
      reviewed_by_admin_id: req.user.id,
    }, { where: { id: requestId } });

    res.json({ message: "❌ KYC rejected" });
  } catch (err) {
    console.error("❌ Reject KYC Error:", err);
    res.status(500).json({ error: "Failed to reject KYC" });
  }
});

module.exports = router;

// apps/backend-api/src/routes/adminRoutes.js
const express = require('express');
const { verifyAdmin, verifyToken } = require('../middlewares/authMiddleware');
const router = express.Router();

// Debugging Middleware
console.log("✅ VerifyAdmin Middleware:", verifyAdmin);
console.log("✅ VerifyToken Middleware:", verifyToken);

// ✅ Admin-Only Route (Hanya Admin yang Bisa Akses)
router.get('/dashboard', verifyAdmin, (req, res) => {
  res.status(200).json({ message: "Welcome to Admin Dashboard" });
});

module.exports = router;

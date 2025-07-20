// apps/backend-api/src/routes/authRoutes.js
const express = require('express');
const { register, login, profile, resetPassword, forgotPassword, verifyEmailByLink, resendVerificationLink } = require('../controllers/authController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const router = express.Router();
const EmailVerification = require("../models/EmailVerification");
const User = require("../models/User");
const { verifyOtp, resendOtp } = require("../controllers/emailOtpController");
const { connectWallet, disconnectWallet } = require("../controllers/authController");



// Debugging Middleware
console.log("✅ VerifyToken Middleware:", verifyToken);
console.log("✅ RequireRole Middleware:", requireRole);

// ✅ Register Route
router.post('/register', register);

router.post('/verify-email-link', verifyEmailByLink);

router.post('/resend-verification-link', resendVerificationLink);

// ✅ Login Route
router.post('/login', login);

// ✅ Profile Route (User sendiri)
router.get('/profile', verifyToken, profile);

// ✅ Profile Route (Admin - User Lain)
router.get('/profile/:id', verifyToken, requireRole("admin"), profile);


router.post('/logout', (req, res) => {
  res.clearCookie("jwt_token", {
    path: "/",
    secure: true,
    sameSite: "Strict",
  });
  res.status(200).json({ message: "Logged out successfully." });
});


// ✅ Verifikasi Email via Token
router.get('/verify', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Missing token" });
    }

    const record = await EmailVerification.findOne({ where: { token } });

    if (!record) {
      return res.status(404).json({ message: "Invalid or expired token" });
    }

    if (new Date() > record.expiresAt) {
      await EmailVerification.destroy({ where: { token } }); // Hapus token expired
      return res.status(410).json({ message: "Token expired" });
    }

    const user = await User.findByPk(record.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isEmailVerified = true;
    await user.save();

    await EmailVerification.destroy({ where: { userId: user.id } }); // Hapus token setelah berhasil

    return res.redirect(""); // ✅ Redirect ke halaman sukses frontend
  } catch (error) {
    console.error("❌ Email verification error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Verifikasi OTP
router.post("/verify-otp", verifyOtp);

// ✅ Resend OTP
router.post("/resend-otp", resendOtp);



router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// ✅ Connect Wallet (simpan address ke user)
router.post("/connect-wallet", verifyToken, connectWallet);

// ✅ Disconnect Wallet (hapus address dari user)
router.post("/disconnect-wallet", verifyToken, disconnectWallet);

module.exports = router;

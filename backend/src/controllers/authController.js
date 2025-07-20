// apps/backend-api/src/controllers/authController.js
const { registerUser, loginUser, getProfile } = require('../services/authService');
const { validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const EmailVerification = require('../models/EmailVerification'); // ✅ tambahkan ini
const sendEmail = require('../utils/emailService'); // kalau belum
const crypto = require("crypto");
const User = require('../models/User'); // ⬅️ Tambahkan ini
const bcrypt = require("bcryptjs"); // ⬅️ Pastikan ini juga ada
const { Op } = require("sequelize"); // ✅ Tambahkan ini
const { giveReferralSignupBonus } = require('../services/referralBonusService');
const UserOwnedCustomizationParts = require('../models/UserOwnedCustomizationParts');
const UserTransaction = require("../models/UserTransaction");
const SignupBonusConfig = require("../models/SignupBonusConfig");
const UserBalance = require("../models/UserBalance");
const SbpTokenHistory = require("../models/SbpTokenHistory");
const SbpBalanceDetail = require("../models/SbpBalanceDetail");




// ✅ Fungsi Helper untuk Validasi Input
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// ✅ Register User (dengan OTP 4 digit)
const register = asyncHandler(async (req, res) => {
  try {
    const { email, username, password, wallet, referral } = req.body;
    console.log("🔍 Registering User:", { email, username });

    // 1. Register user seperti biasa
    const user = await registerUser(email, username, password, wallet, referral);
    if (!user) {
      return res.status(400).json({ error: "Registration failed" });
    }

    // 2. Generate token unik untuk email verification (link-based)
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 menit

    // 3. Hapus token/email verification lama, lalu simpan baru
    await EmailVerification.destroy({ where: { userId: user.id } });
    await EmailVerification.create({
      userId: user.id,
      token,
      expiresAt: expires,
    });

    // 4. Kirim email link verifikasi
    const verifyLink = ``;
    const body = `
      Hi ${user.username},
      
      Silakan klik link berikut untuk verifikasi email Anda (berlaku 30 menit):
      ${verifyLink}
      
      Jika Anda tidak merasa mendaftar, abaikan email ini.
    `.trim();

    await sendEmail(email, "", body);

    console.log("✅ User Registered & Verification Link Sent:", { id: user.id, email });

    // 5. Balas response tanpa kirim OTP
    res.status(201).json({
      message: "User registered successfully. Please check your email for the verification link.",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Registration Error:", error.message);
    res.status(500).json({ error: "Registration failed. Please try again later." });
  }
});

const login = asyncHandler(async (req, res) => {
  try {
    const { identifier, password, checkRacePenalty } = req.body;
    const { token, user } = await loginUser(identifier, password);

    let penaltyApplied = false;

    // ✅ Cek penalty jika dari game
    if (checkRacePenalty === true) {
      const UserRaceResult = require('../models/UserRaceResult');
      const UserInventoryRace = require('../models/UserInventoryRace');
      const UserOwnedCustomizationParts = require('../models/UserOwnedCustomizationParts');

      const pendingRace = await UserRaceResult.findOne({
        where: {
          userId: user.id,
          status: "pending"
        }
      });

      if (pendingRace) {
        const car = await UserInventoryRace.findOne({
          where: { userId: user.id, assetId: pendingRace.assetId }
        });

        pendingRace.status = "abandoned";
        await pendingRace.save();
        penaltyApplied = true;
        // TIDAK ADA proses pengurangan durability
      }

    }


    // ✅ Daily Airdrop Login Progress
    try {
      const moment = require("moment");
      const Decimal = require("decimal.js");
      const DailyAirdropConfig = require("../models/DailyAirdropConfig");
      const UserDailyAirdropProgress = require("../models/UserDailyAirdropProgress");

      const today = moment().format("YYYY-MM-DD");
      const config = await DailyAirdropConfig.findOne();

      if (config) {
        const [progress] = await UserDailyAirdropProgress.findOrCreate({
          where: { userId: user.id },
        });

        if (progress.lastLoginDate !== today) {
          progress.loginStreak += 1;
          progress.lastLoginDate = today;

          const currentPending = new Decimal(progress.pendingSbp || 0);
          const rewardPerDay = new Decimal(config.sbpReward || 0);
          progress.pendingSbp = currentPending.plus(rewardPerDay).toFixed();

          await progress.save();
        }
      }
    } catch (e) {
      console.error("❌ Gagal update progress login airdrop:", e);
      // tidak menggagalkan login
    }

    // ✅ Beri response
    res.status(200).json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      penaltyApplied
    });

  } catch (error) {
    const status = error.status || 500;
    const message = error.message || "Login gagal";
    console.error("❌ Login error:", message);
    res.status(status).json({ message });
  }
});


// ✅ Verifikasi Email by Link
const verifyEmailByLink = asyncHandler(async (req, res) => {
  try {
    const { email, token } = req.body;
    if (!email || !token) {
      return res.status(400).json({ message: "Email and token are required" });
    }

    // Cari user & token
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const record = await EmailVerification.findOne({ where: { token, userId: user.id } });
    if (!record) return res.status(404).json({ message: "Link tidak valid atau sudah dipakai." });

    if (new Date() > record.expiresAt) {
      await EmailVerification.destroy({ where: { token } });
      return res.status(410).json({ message: "Link expired" });
    }

    // Set verified
    user.isEmailVerified = true;
    await user.save();
    await EmailVerification.destroy({ where: { userId: user.id } });

    // Grant Paket White, bonus signup, referral bonus (copy dari verifyOtp)
    await UserTransaction.create({
      userId: user.id,
      type: "TOPUP",
      amount: 0,
      status: "Sales",
      transactionId: `AUTO-${Date.now()}-${user.id}`,
      description: "Auto grant Paket White setelah verifikasi email (by link)",
      responseDesc: "Verifikasi Email - Auto Paket White",
      rawStatusCode: "S",
    });

    const SignupBonusConfig = require("../models/SignupBonusConfig");
    const Decimal = require("decimal.js");
    const UserBalance = require("../models/UserBalance");
    const SbpTokenHistory = require("../models/SbpTokenHistory");
    const SbpBalanceDetail = require("../models/SbpBalanceDetail");

    const config = await SignupBonusConfig.findOne({ order: [["createdAt", "DESC"]] });
    const bonusAmount = config ? new Decimal(config.sbpAmount) : new Decimal(0);

    if (bonusAmount.gt(0)) {
      const [balance, created] = await UserBalance.findOrCreate({
        where: { userId: user.id },
        defaults: { sbp: bonusAmount.toString() },
      });
      if (!created) {
        balance.sbp = new Decimal(balance.sbp).plus(bonusAmount);
        await balance.save();
      }

      await SbpTokenHistory.create({
        userId: user.id,
        type: "bonus",
        amount: bonusAmount.toString(),
        description: "Bonus SBP dari daftar akun White",
      });

      await SbpBalanceDetail.create({
        userId: user.id,
        source: "signup_bonus",
        amount: bonusAmount.toString(),
      });
    }

    await giveReferralSignupBonus(user);

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("❌ Gagal verifikasi email by link:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


const resendVerificationLink = async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ message: "Email or username is required" });
    }

    // Regex sederhana untuk cek email
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    // Cari user by email atau username
    const user = await User.findOne({
      where: isEmail ? { email: identifier } : { username: identifier },
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isEmailVerified)
      return res.status(400).json({ message: "Email already verified" });

    // Ambil email user (kalau login pakai username)
    const email = user.email;

    // Generate new token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await EmailVerification.destroy({ where: { userId: user.id } });
    await EmailVerification.create({ userId: user.id, token, expiresAt: expires });

    // Send verification email
    const verifyLink = ``;
    const body = `
      Hi ${user.username},
      
      Silakan klik link berikut untuk verifikasi email Anda (berlaku 30 menit):
      ${verifyLink}
      
      Jika Anda tidak merasa mendaftar, abaikan email ini.
    `.trim();

    await sendEmail(email, "", body);

    return res
      .status(200)
      .json({ message: "Link verifikasi telah dikirim ulang ke email Anda." });
  } catch (error) {
    console.error("❌ Resend Verification Link Error:", error);
    res
      .status(500)
      .json({ message: "Gagal mengirim ulang link verifikasi. Coba lagi nanti." });
  }
};



const profile = asyncHandler(async (req, res) => {
  console.log("🔍 Profile Request Received");

  if (!req.user) {
    console.error("❌ No User Data in Request");
    return res.status(401).json({ message: "Unauthorized: No user data" });
  }

  const userId = req.params.id || req.user.id;
  console.log("🔍 Fetching Profile for User ID:", userId);

  const user = await getProfile(userId);
  if (!user) {
    console.error("❌ User not found");
    return res.status(404).json({ message: "User not found" });
  }

  console.log("✅ Profile Loaded for:", user.username);
  res.status(200).json({
    message: "Profile fetched successfully",
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      userLevel: user.userLevel,
      exchangerLevel: user.exchangerLevel,
      circuitOwnerLevel: user.circuitOwnerLevel,
      isCompanyExchanger: user.isCompanyExchanger,
      createdAt: user.createdAt,
    },
  });
});

const { verifyOTP, resendOTP } = require('../services/authService');

// ✅ Verifikasi OTP
const verifyOtp = asyncHandler(async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ error: "User ID and OTP are required" });
    }

    const user = await verifyOTP(userId, otp);

    res.status(200).json({
      message: "Email verified successfully",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isEmailVerified: true,
      },
    });
  } catch (error) {
    console.error("❌ OTP Verification Error:", error.message);
    res.status(400).json({ error: error.message });
  }
});

// ✅ Resend OTP
const resendOtp = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    await resendOTP(userId);

    res.status(200).json({ message: "OTP resent to email" });
  } catch (error) {
    console.error("❌ Resend OTP Error:", error.message);
    res.status(400).json({ error: error.message });
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(404).json({ message: "User not found" });

  const token = crypto.randomBytes(20).toString("hex");
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

  user.resetPasswordToken = token;
  user.resetPasswordExpires = expires;
  await user.save();

  const link = ``;
  const message = ``;
  await sendEmail(user.email, "", message);

  res.json({ message: "Reset link sent to email" });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword)
    return res.status(400).json({ message: "All fields are required" });

  const user = await User.findOne({ where: { email, resetPasswordToken: token } });
  if (!user) return res.status(404).json({ message: "Invalid token or email" });

  if (new Date() > user.resetPasswordExpires) {
    return res.status(410).json({ message: "Token expired" });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  res.json({ message: "Password has been reset successfully" });
});

// ✅ Connect Wallet: Simpan ke database
const connectWallet = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { address } = req.body;

  if (!userId || !address) {
    return res.status(400).json({ error: "User ID dan wallet address diperlukan" });
  }

  // Cek apakah wallet sudah dipakai user lain
  const alreadyUsed = await User.findOne({
    where: {
      wallet: address,
      id: { [Op.ne]: userId }, // ✅ pakai Op dari import, bukan User.sequelize.Op
    },
  });


  if (alreadyUsed) {
    return res.status(400).json({ error: "Wallet ini sudah digunakan oleh akun lain." });
  }

  await User.update({ wallet: address }, { where: { id: userId } });
  res.json({ success: true, message: "Wallet berhasil disimpan." });
});

// ✅ Disconnect Wallet: Hapus dari database
const disconnectWallet = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  await User.update({ wallet: null }, { where: { id: userId } });
  res.json({ success: true, message: "Wallet berhasil dihapus." });
});




// ✅ Export Functions
module.exports = {
  register,
  login,
  profile,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  connectWallet,
  disconnectWallet,
  verifyEmailByLink,
  resendVerificationLink
};

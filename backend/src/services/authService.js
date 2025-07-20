const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const EmailVerification = require("../models/EmailVerification");
const { generateToken } = require("../utils/jwtUtils");
const sendEmail = require("../utils/emailService");
const { giveReferralSignupBonus } = require("../services/referralBonusService");

// ✅ Hash password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Helper untuk membuat error dengan status
const createError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};


// ✅ Register user
exports.registerUser = async (email, username, password, wallet, referral) => {
  console.log("🔍 Registering User:", { email, username });

  const [existingEmail, existingUsername] = await Promise.all([
    User.findOne({ where: { email } }),
    User.findOne({ where: { username } })
  ]);

  if (existingEmail) throw new Error("Email already registered");
  if (existingUsername) throw new Error("Username already taken");

  const hashedPassword = await hashPassword(password);

  let referredBy = null;
  if (referral) {
    const referrer = await User.findOne({ where: { referralCode: referral } });
    if (!referrer) throw new Error("Invalid referral code");
    referredBy = referrer.id;
  }

  const user = await User.create({
    email,
    username,
    password: hashedPassword,
    wallet,
    referralCode: null,
    referredById: referredBy,
    role: "user",
    isActive: true,
    isBanned: false,
    isEmailVerified: false
  });

  // ✅ Kirim OTP setelah register
  //await exports.resendOTP(user.id);

  return user;
};

// ✅ Resend OTP (atau digunakan pertama kali)
exports.resendOTP = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

  await EmailVerification.destroy({ where: { userId } });
  await EmailVerification.create({ userId, token: otp, expiresAt: expires });

  const body = `Kode OTP untuk verifikasi email kamu adalah: ${otp}\n\nJangan bagikan OTP ini ke siapa pun. Berlaku selama 10 menit.`;
  await sendEmail(user.email, "", body);

  console.log("✅ OTP sent to:", user.email, "OTP:", otp);
};

// ✅ Verifikasi OTP
exports.verifyOtp = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.status(400).json({ error: "User ID and OTP are required" });
  }

  const user = await verifyOTP(userId, otp);
  console.log("✅ Email verified for user:", user.username, "| referredById:", user.referredById);

  await giveReferralSignupBonus(user); // ⬅️ sekarang dipanggil DI SINI, pasti jalan
  console.log("🎯 Bonus referral signup sudah diproses");

  res.status(200).json({
    message: "Email verified successfully",
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      isEmailVerified: true,
    },
  });
});


// ✅ Login
exports.loginUser = async (identifier, password) => {
  const user = await User.findOne({
    where: {
      [Op.or]: [{ email: identifier }, { username: identifier }],
    },
  });

  if (!user) throw createError("Email atau password salah", 401);
  if (!user.isActive) throw createError("Akun Anda tidak aktif", 403);
  if (user.isBanned) throw createError("Akun Anda diblokir", 403);
  if (!user.isEmailVerified) throw createError("Email belum diverifikasi", 403);
  if (user.isSuspended) throw createError("Akun Anda telah ditangguhkan", 403);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw createError("Email atau password salah", 401);

  const token = generateToken(user);
  return { token, user };
};

// ✅ Get profile
exports.getProfile = async (userId) => {
  if (!userId || typeof userId !== "number") {
    throw new Error("Invalid User ID");
  }

  const user = await User.findByPk(userId, {
    attributes: {
      exclude: ["password", "deletedAt"],
    },
  });

  if (!user) throw new Error("User not found");

  return user;
};

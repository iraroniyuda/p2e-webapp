const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

const User = require("../models/User");
const EmailVerification = require("../models/EmailVerification");
const { generateToken } = require("../utils/jwtUtils");
const sendEmail = require("../utils/emailService");

// ✅ Hash password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
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
  await exports.resendOTP(user.id);

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
exports.verifyOTP = async (userId, otp) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  const record = await EmailVerification.findOne({ where: { userId, token: otp } });
  if (!record) throw new Error("Invalid OTP");

  if (new Date() > record.expiresAt) {
    await EmailVerification.destroy({ where: { userId } });
    throw new Error("OTP expired");
  }

  user.isEmailVerified = true;
  await user.save();
  await EmailVerification.destroy({ where: { userId } });

  console.log("✅ Email verified for user:", user.username);
  return user;
};

// ✅ Login
exports.loginUser = async (identifier, password) => {
  const user = await User.findOne({
    where: {
      [Op.or]: [{ email: identifier }, { username: identifier }],
    },
  });

  if (!user) throw new Error("Invalid credentials");
  if (!user.isActive) throw new Error("Account is inactive");
  if (user.isBanned) throw new Error("Account is banned");
  if (!user.isEmailVerified) throw new Error("Email not verified");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

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

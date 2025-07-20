// src/controllers/emailOtpController.js
const EmailVerification = require("../models/EmailVerification");
const User = require("../models/User");
const UserTransaction = require("../models/UserTransaction");
const UserBalance = require("../models/UserBalance");
const SbpTokenHistory = require("../models/SbpTokenHistory");
const sendEmail = require("../utils/emailService");
const crypto = require("crypto");
const { giveReferralSignupBonus } = require("../services/referralBonusService");
const SignupBonusConfig = require("../models/SignupBonusConfig");
const Decimal = require("decimal.js");
const SbpBalanceDetail = require("../models/SbpBalanceDetail");

// ✅ Verifikasi OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Temukan user berdasarkan email
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Temukan OTP yang cocok untuk user
    const record = await EmailVerification.findOne({
      where: { token: otp, userId: user.id },
    });
    if (!record) return res.status(404).json({ message: "OTP invalid or expired" });

    if (new Date() > record.expiresAt) {
      await EmailVerification.destroy({ where: { token: otp } });
      return res.status(410).json({ message: "OTP expired" });
    }

    // ✅ Verifikasi email
    user.isEmailVerified = true;
    await user.save();
    await EmailVerification.destroy({ where: { userId: user.id } });

    // ✅ Grant Paket White (log auto-topup)
    await UserTransaction.create({
      userId: user.id,
      type: "TOPUP",
      amount: 0,
      status: "Sales",
      transactionId: `AUTO-${Date.now()}-${user.id}`,
      description: "Auto grant Paket White setelah verifikasi email",
      responseDesc: "Verifikasi Email - Auto Paket White",
      rawStatusCode: "S",
    });

    // ✅ Bonus SBP signup
    const config = await SignupBonusConfig.findOne({ order: [["createdAt", "DESC"]] });
    const bonusAmount = config ? new Decimal(config.sbpAmount) : new Decimal(0);

    if (bonusAmount.gt(0)) {
      const [balance, created] = await UserBalance.findOrCreate({
        where: { userId: user.id },
        defaults: { sbp: bonusAmount.toString() },
      });

      if (!created) {
        balance.sbp = balance.sbp.plus(bonusAmount);
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

    // ✅ Bonus referral jika ada
    await giveReferralSignupBonus(user);

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("❌ Gagal verifikasi OTP:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// ✅ Resend OTP
exports.resendOtp = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(404).json({ message: "User not found" });

  const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

  await EmailVerification.destroy({ where: { userId: user.id } }); // Hapus OTP lama
  await EmailVerification.create({ userId: user.id, token: otp, expiresAt: expires });

  const body = ``;
  await sendEmail(email, "", body);

  return res.status(200).json({ message: "OTP sent successfully" });
};

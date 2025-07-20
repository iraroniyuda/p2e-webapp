const applyReferralBonus = require("../utils/applyReferralBonus");

const autoUpgradeUserLevel = require("../utils/autoUpgradeUserLevel");
const User = require("../models/User");
const UserActivationProgress = require("../models/UserActivationProgress");
const Decimal = require("decimal.js");

const activateUserAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    const progress = await UserActivationProgress.findOne({ where: { userId } });
    if (!progress) return res.status(404).json({ error: "Data aktivasi tidak ditemukan." });

    if (!progress.isReady) {
      return res.status(400).json({ error: "Belum memenuhi syarat aktivasi akun." });
    }

    if (progress.isActivated) {
      return res.status(400).json({ error: "Akun sudah diaktivasi sebelumnya." });
    }

    await applyReferralBonus(user, `buy_package_${progress.packageId}`, {
      valueRupiah: 0,
      valueSBP: new Decimal(progress.requiredSBP || 0),
      valueTBP: new Decimal(progress.requiredTBP || 0),
      valueRACE: new Decimal(progress.requiredTBP || 0).mul(10), // RACE_PER_TBP
      transactionAmount: 0,
    });

    user.userLevel = progress.userLevelToGrant;
    await user.save();

    progress.isActivated = true;
    progress.activatedAt = new Date();
    await progress.save();

    return res.status(200).json({
      message: "✅ Akun berhasil diaktivasi. Bonus telah diberikan dan level telah diupgrade.",
      newLevel: user.userLevel,
    });
  } catch (err) {
    console.error("❌ Gagal aktivasi akun:", err);
    return res.status(500).json({ error: "Terjadi kesalahan saat aktivasi akun." });
  }
};

const getUserActivationProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = await UserActivationProgress.findOne({ where: { userId } });
    res.json(progress || null);
  } catch (err) {
    console.error("❌ Gagal ambil progress aktivasi:", err);
    res.status(500).json({ error: "Gagal ambil progress aktivasi" });
  }
};

module.exports = {
  activateUserAccount,
  getUserActivationProgress,
};



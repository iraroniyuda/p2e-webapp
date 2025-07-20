const { Op } = require("sequelize");
const UserActivationProgress = require("../models/UserActivationProgress");
const UserPolClaimHistory = require("../models/UserPolClaimHistory");
const PolClaimConfig = require("../models/PolClaimConfig");
const User = require("../models/User");
const { sendPolToUser } = require("../utils/sendPolToUser");


// POST /api/claim-pol
const claimPol = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    // 1. Cari progress aktivasi paket yang belum selesai dan levelnya green/blue/double_blue
    const progress = await UserActivationProgress.findOne({
      where: {
        userId,
        isActivated: false,
        userLevelToGrant: { [Op.in]: ["green", "blue", "double_blue"] }, // field di UserActivationProgress
      }
    });

    if (!progress) return res.status(400).json({ error: "Tidak ada progress aktivasi paket eligible" });

    // 2. Pastikan user BELUM pernah klaim POL untuk paket + level ini
    const claimed = await UserPolClaimHistory.findOne({
      where: {
        userId,
        levelName: progress.userLevelToGrant,    // field di UserPolClaimHistory
        packageId: progress.packageId,           // pastikan field packageId ada di model & table!
      }
    });
    if (claimed) return res.status(400).json({ error: "POL untuk paket ini sudah pernah diklaim" });

    // 3. Ambil jumlah POL dari config
    const config = await PolClaimConfig.findOne({ where: { levelName: progress.userLevelToGrant } });
    if (!config) return res.status(400).json({ error: "Config POL tidak ditemukan untuk level paket" });

    if (!user.wallet) return res.status(400).json({ error: "User belum menghubungkan wallet" });

    // 4. Kirim POL ke wallet user
    const txHash = await sendPolToUser(user.wallet, config.amountPOL.toFixed());

    // 5. Catat histori klaim (pakai levelName)
    await UserPolClaimHistory.create({
      userId,
      levelName: progress.userLevelToGrant,     // field yang benar!
      packageId: progress.packageId,
      claimedAt: new Date(),
      txHash,
      amountPOL: config.amountPOL.toFixed(),
    });

    res.json({ success: true, txHash, amountPOL: config.amountPOL.toFixed(), level: progress.userLevelToGrant });
  } catch (err) {
    console.error("❌ Error claim POL:", err);
    res.status(500).json({ error: "Gagal proses klaim POL", detail: err.message });
  }
};


// GET /api/claim-pol/eligibility
const getPolClaimEligibility = async (req, res) => {
  try {
    const userId = req.user.id;

    // Cari progress aktivasi yang eligible
    const progress = await UserActivationProgress.findOne({
      where: {
        userId,
        isActivated: false,
        userLevelToGrant: { [Op.in]: ["green", "blue", "double_blue"] }, // field di UserActivationProgress
      }
    });

    if (!progress) {
      return res.json({ eligible: false, reason: "Tidak ada progress aktivasi paket eligible" });
    }

    // Pastikan belum pernah klaim POL untuk package + level ini
    const claimed = await UserPolClaimHistory.findOne({
      where: {
        userId,
        levelName: progress.userLevelToGrant,   // field di UserPolClaimHistory
        packageId: progress.packageId,
      }
    });
    if (claimed) {
      return res.json({ eligible: false, reason: "POL untuk paket ini sudah diklaim" });
    }

    // Ambil config jumlah POL
    const config = await PolClaimConfig.findOne({ where: { levelName: progress.userLevelToGrant } });
    if (!config) {
      return res.json({ eligible: false, reason: "Config POL tidak ditemukan untuk level paket" });
    }

    // Return eligible
    return res.json({
      eligible: true,
      levelName: progress.userLevelToGrant,
      packageId: progress.packageId,
      amountPOL: config.amountPOL.toFixed(),
    });

  } catch (err) {
    console.error("❌ Error getPolClaimEligibility:", err);
    res.status(500).json({ error: "Gagal cek eligibility claim POL", detail: err.message });
  }
};

const getPolClaimHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const list = await UserPolClaimHistory.findAll({
      where: { userId },
      order: [["claimedAt", "DESC"]],
    });
    res.json({ data: list });
  } catch (err) {
    res.status(500).json({ error: "Gagal ambil histori claim POL" });
  }
};

module.exports = { claimPol, getPolClaimEligibility, getPolClaimHistory };

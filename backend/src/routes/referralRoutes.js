// src/routes/referralRoutes.js

const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");
const User = require("../models/User");
const ReferralSettings = require("../models/ReferralSettings");
const { Op } = require("sequelize");

// ✅ Create Custom Referral Code
router.post("/create", verifyToken, async (req, res) => {
  try {
    const { referralCode } = req.body;
    if (!referralCode) {
      console.error("Referral code is missing.");
      return res.status(400).json({ message: "Referral code is required" });
    }

    const existingCode = await User.findOne({ where: { referralCode } });
    if (existingCode) {
      console.error("Referral code already exists:", referralCode);
      return res.status(400).json({ message: "Referral code already exists" });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      console.error("User not found:", req.user.id);
      return res.status(404).json({ message: "User not found" });
    }

    if (user.referralCode) {
      console.error("User already has a referral code:", user.referralCode);
      return res.status(400).json({ message: "You already have a referral code" });
    }

    user.referralCode = referralCode.toUpperCase();
    await user.save();

    const referralLink = ``;
    res.json({ referralCode: user.referralCode, referralLink });
  } catch (error) {
    console.error("Error creating referral code:", error);
    res.status(500).json({ message: "Error creating referral code" });
  }
});

// ✅ Get Referral Link
router.get("/link", verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Jika user tidak punya referralCode, kirimkan kosong
    if (!user.referralCode) {
      return res.json({ referralLink: "", referralCode: "" });
    }

    const referralLink = ``;
    res.json({ referralLink, referralCode: user.referralCode });
  } catch (error) {
    console.error("Error fetching referral link:", error);
    res.status(500).json({ message: "Error fetching referral link" });
  }
});



// ✅ Referral Tree Endpoint dengan Rekursif
// src/routes/referralRoutes.js
router.get("/tree", verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const upline = user.referredById
      ? await User.findByPk(user.referredById, { attributes: ["username"] })
      : null;

    // ✅ Fetch Max Level dari Pengaturan Admin
    const referralSettings = await ReferralSettings.findAll();
    const maxLevel = referralSettings.length;

    if (maxLevel === 0) {
      return res.status(400).json({ message: "Referral settings not configured by admin." });
    }

    // ✅ Recursive Function untuk Fetch Downlines
    const getDownlinesRecursive = async (userId, level = 1) => {
      if (level > maxLevel) return [];
      const downlines = await User.findAll({
        where: { referredById: userId },
        attributes: ["id", "username"],
      });

      const result = [];
      for (const downline of downlines) {
        const subDownlines = await getDownlinesRecursive(downline.id, level + 1);
        result.push({
          username: downline.username,
          level,
          subDownlines,
        });
      }
      return result;
    };

    const downlines = await getDownlinesRecursive(user.id);
    res.json({
      upline: upline ? upline.username : "Tidak ada upline",
      downlines,
    });
  } catch (error) {
    console.error("Error fetching referral tree:", error);
    res.status(500).json({ message: "Error fetching referral tree" });
  }
});


// ✅ Get Referral Tree Function
async function getReferralTree(userId, maxLevel) {
  let currentLevel = 1;
  let currentUsers = [userId];
  let referralTree = [];

  while (currentLevel <= maxLevel && currentUsers.length > 0) {
    const downlines = await User.findAll({
      where: { referredById: currentUsers },
      attributes: ['id', 'username']
    });

    referralTree.push({ level: currentLevel, users: downlines });
    currentUsers = downlines.map(user => user.id);
    currentLevel++;
  }

  return referralTree;
}

// ✅ Get Referral Settings (Admin Only)

router.get("/settings", async (req, res) => {
  try {
    console.log("✅ Fetching Referral Settings");
    const settings = await ReferralSettings.findAll();
    console.log("✅ Fetched Settings:", settings);
    res.json(settings);
  } catch (error) {
    console.error("❌ Error fetching referral settings:", error);
    res.status(500).json({ message: "Error fetching referral settings" });
  }
});


// ✅ Save Referral Settings
router.post("/settings", async (req, res) => {
  try {
    const settings = req.body;
    await ReferralSettings.destroy({ where: {} });
    await ReferralSettings.bulkCreate(settings);
    res.json({ message: "Referral settings updated" });
  } catch (error) {
    console.error("❌ Error saving referral settings:", error);
    res.status(500).json({ message: "Error saving referral settings" });
  }
});

router.delete("/settings/:level", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { level } = req.params;
    await ReferralSettings.destroy({ where: { level } });
    res.json({ message: `Level ${level} deleted` });
  } catch (error) {
    console.error("Error deleting referral setting:", error);
    res.status(500).json({ message: "Error deleting referral setting" });
  }
});

module.exports = router;

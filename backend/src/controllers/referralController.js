// apps/backend-api/src/controllers/referralController.js
const referralService = require("../services/referralService");

// Ambil pengaturan referral
exports.getSettings = async (req, res) => {
  try {
    const settings = await referralService.getReferralSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching settings" });
  }
};

// Perbarui pengaturan referral
exports.updateSettings = async (req, res) => {
  try {
    const settings = req.body;
    await referralService.updateReferralSettings(settings);
    res.json({ message: "Settings updated" });
  } catch (error) {
    res.status(500).json({ message: "Error updating settings" });
  }
};

// Ambil referral tree hingga level tertentu
exports.getTree = async (req, res) => {
  try {
    const { maxLevel } = req.query;
    const tree = await referralService.getReferralTree(req.user.id, parseInt(maxLevel, 10));
    res.json(tree);
  } catch (error) {
    res.status(500).json({ message: "Error fetching referral tree" });
  }
};

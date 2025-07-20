const ReferralSettings = require("../models/ReferralSettings");
const User = require("../models/User");

// Ambil pengaturan level dan bonus
exports.getReferralSettings = async () => {
  return await ReferralSettings.findAll();
};

// Perbarui pengaturan referral
exports.updateReferralSettings = async (settings) => {
  await ReferralSettings.destroy({ where: {} }); // Hapus semua pengaturan sebelumnya
  return await ReferralSettings.bulkCreate(settings);
};

// Fetch referral tree hingga n level
exports.getReferralTree = async (userId, maxLevel) => {
  let currentLevel = 1;
  let currentUsers = [userId];
  let referralTree = [];

  while (currentLevel <= maxLevel && currentUsers.length > 0) {
    const downlines = await User.findAll({
      where: { referredById: currentUsers },
      attributes: ['id', 'username', 'referralCode'],
    });

    referralTree.push({ level: currentLevel, users: downlines });
    currentUsers = downlines.map(user => user.id);
    currentLevel++;
  }

  return referralTree;
};

exports.calculateReferralBonus = async (userId, amount) => {
  const settings = await ReferralSettings.findAll();
  let totalBonus = 0;
  let currentUserId = userId;

  for (const setting of settings) {
    const user = await User.findByPk(currentUserId);
    if (!user || !user.referredById) break;

    const bonus = amount * (setting.bonusPercentage / 100);
    totalBonus += bonus;
    currentUserId = user.referredById;
  }

  return totalBonus;
};

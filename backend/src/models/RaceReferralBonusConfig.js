const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * Konfigurasi bonus referral untuk userLevel tertentu
 * Contoh: green dapat 2.5% direct + 1%-0.2% generational
 */
const RaceReferralBonusConfig = sequelize.define("RaceReferralBonusConfig", {
  userLevel: {
    type: DataTypes.ENUM("green", "blue", "double_blue"),
    allowNull: false,
  },

  // 🎯 Bonus untuk referral langsung (Gen 1)
  directBonusPercent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
  },

  // 🧬 Bonus Generasi (Gen 1–5 dihitung dari posisi di atas direct)
  gen1BonusPercent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
  },
  gen2BonusPercent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
  },
  gen3BonusPercent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
  },
  gen4BonusPercent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
  },
  gen5BonusPercent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
  },
    gen6BonusPercent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: "RaceReferralBonusConfigs",
  timestamps: true,
});

module.exports = RaceReferralBonusConfig;

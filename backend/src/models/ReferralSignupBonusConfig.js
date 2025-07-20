// models/ReferralSignupBonusConfig.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ReferralSignupBonusConfig = sequelize.define("ReferralSignupBonusConfig", {
  bonusPerSignup: {
    type: DataTypes.DECIMAL,
    defaultValue: 0,
  },
  maxDailyBonus: {
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
  maxTotalBonus: {
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
  isOpen: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // jika true → max tidak berlaku
  },
}, {
  tableName: "ReferralSignupBonusConfig",
  timestamps: true,
});


module.exports = ReferralSignupBonusConfig;

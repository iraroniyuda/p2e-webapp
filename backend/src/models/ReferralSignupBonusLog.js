// models/ReferralSignupBonusLog.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const ReferralSignupBonusLog = sequelize.define("ReferralSignupBonusLog", {
  uplineUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  downlineUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
}, {
  tableName: "ReferralSignupBonusLogs",
  timestamps: true,
});

ReferralSignupBonusLog.belongsTo(User, { foreignKey: "uplineUserId", as: "upline" });
ReferralSignupBonusLog.belongsTo(User, { foreignKey: "downlineUserId", as: "downline" });

module.exports = ReferralSignupBonusLog;

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserBonusLog = sequelize.define("UserBonusLog", {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  bonusConfigId: { type: DataTypes.INTEGER, allowNull: true },
  exclusiveGroup: { type: DataTypes.STRING },
  transactionType: { type: DataTypes.STRING },
}, {
  timestamps: true,
});

module.exports = UserBonusLog;

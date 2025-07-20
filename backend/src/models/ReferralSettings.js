const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ReferralSettings = sequelize.define("ReferralSettings", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  bonusPercentage: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  tableName: "ReferralSettings",
  timestamps: false,
});

module.exports = ReferralSettings;

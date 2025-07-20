const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const MiningClickLog = sequelize.define("MiningClickLog", {
  referralMiningLinkId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isValid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  claimed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  fingerprint: {
    type: DataTypes.STRING,
    allowNull: true, // optional untuk fallback
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

}, {
  tableName: "MiningClickLogs",
  timestamps: true,
});

module.exports = MiningClickLog;

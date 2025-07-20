// models/RaceWinRewardConfig.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RaceWinRewardConfig = sequelize.define("RaceWinRewardConfig", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  winCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5, // Default 5 kemenangan, bisa diubah admin
  },
  note: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: "RaceWinRewardConfigs", // Sesuaikan penamaan tabel plural
  timestamps: true, // Biar otomatis ada createdAt/updatedAt
});

module.exports = RaceWinRewardConfig;

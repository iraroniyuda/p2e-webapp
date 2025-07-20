const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserCarUpgradeHistory = sequelize.define("UserCarUpgradeHistory", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  assetId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  partType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  previousLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  newLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: "UserCarUpgradeHistories",
  timestamps: true, // akan otomatis buat createdAt
});

module.exports = UserCarUpgradeHistory;

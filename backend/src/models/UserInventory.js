const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const UserInventory = sequelize.define("UserInventory", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  assetType: {
    type: DataTypes.STRING, // contoh: 'car', 'upgrade_engine'
    allowNull: false,
  },
  assetId: {
    type: DataTypes.INTEGER, // contoh: ID mobil atau level upgrade
    allowNull: false,
  },
}, {
  tableName: "UserInventories",
  timestamps: true,
});

UserInventory.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});
module.exports = UserInventory;

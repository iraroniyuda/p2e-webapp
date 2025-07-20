const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const GameAssetStoreRace = require("./GameAssetStoreRace");

const UserInventoryRace = sequelize.define("UserInventoryRace", {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  assetId: { type: DataTypes.INTEGER, allowNull: false },
  price: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    defaultValue: "0",
  },

  assetType: { type: DataTypes.STRING, allowNull: false },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
}, {
  tableName: "UserInventoryRaces",
  timestamps: true,
});

User.hasMany(UserInventoryRace, { foreignKey: "userId", as: "raceInventory" });
UserInventoryRace.belongsTo(User, { foreignKey: "userId", as: "user" });

GameAssetStoreRace.hasMany(UserInventoryRace, { foreignKey: "assetId", as: "purchases" });
UserInventoryRace.belongsTo(GameAssetStoreRace, { foreignKey: "assetId", as: "asset" });

module.exports = UserInventoryRace;

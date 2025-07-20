const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");

const User = require("./User");
const GameAssetStoreRace = require("./GameAssetStoreRace");

const UserPurchaseHistoryRace = sequelize.define("UserPurchaseHistoryRace", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  assetId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  assetType: {
    type: DataTypes.ENUM("car", "part"),
    allowNull: false,
  },

  price: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("price");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  bonusGiven: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: "UserPurchaseHistoryRaces",
  timestamps: true,
});

// 🔗 Relasi
User.hasMany(UserPurchaseHistoryRace, { foreignKey: "userId", as: "purchaseHistory" });
UserPurchaseHistoryRace.belongsTo(User, { foreignKey: "userId", as: "user" });

GameAssetStoreRace.hasMany(UserPurchaseHistoryRace, { foreignKey: "assetId", as: "purchaseLogs" });
UserPurchaseHistoryRace.belongsTo(GameAssetStoreRace, { foreignKey: "assetId", as: "asset" });

module.exports = UserPurchaseHistoryRace;

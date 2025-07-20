const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");
const CarRaceRewardConfig = require("./CarRaceRewardConfig");

const GameAssetStoreRace = sequelize.define("GameAssetStoreRace", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  type: {
    type: DataTypes.ENUM("car", "part"),
    allowNull: false,
  },

  description: {
    type: DataTypes.TEXT,
  },

  // 💰 Harga dalam DECIMAL presisi tinggi
  price: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("price");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  currency: {
    type: DataTypes.ENUM("SBP", "RACE", "TBP"),
    defaultValue: "RACE",
  },

  prefabName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // ✅ cocokkan dengan GameObject.name di Unity
  },

  imageUrl: {
    type: DataTypes.STRING,
  },

  stock: {
    type: DataTypes.INTEGER,
    defaultValue: -1, // -1 = unlimited
  },
  valueSBP: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("valueSBP");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: "GameAssetStoreRaces",
  timestamps: true,
});


// 👇 Relasi: GameAssetStoreRace → CarRaceRewardConfig
GameAssetStoreRace.hasOne(CarRaceRewardConfig, {
  foreignKey: "assetId",
  as: "rewardConfig",
});
CarRaceRewardConfig.belongsTo(GameAssetStoreRace, {
  foreignKey: "assetId",
  as: "carAsset",
});


module.exports = GameAssetStoreRace;

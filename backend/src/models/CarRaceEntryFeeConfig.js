const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");
const GameAssetStoreRace = require("./GameAssetStoreRace");

const CarRaceEntryFeeConfig = sequelize.define("CarRaceEntryFeeConfig", {
  assetId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: "GameAssetStoreRaces",
      key: "id",
    },
  },
  feeAmount: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    defaultValue: "0.0",
    get() {
      return new Decimal(this.getDataValue("feeAmount") || 0);
    },
  },
  feeCurrency: {
    type: DataTypes.ENUM("RACE", "SBP", "TBP"),
    defaultValue: "RACE",
  },
}, {
  tableName: "CarRaceEntryFeeConfigs",
  timestamps: true,
});

// Relasi
GameAssetStoreRace.hasOne(CarRaceEntryFeeConfig, {
  foreignKey: "assetId",
  as: "entryFeeConfig",
});
CarRaceEntryFeeConfig.belongsTo(GameAssetStoreRace, {
  foreignKey: "assetId",
  as: "carAsset",
});

module.exports = CarRaceEntryFeeConfig;

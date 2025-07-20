// models/CarRaceRewardConfig.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");

const CarRaceRewardConfig = sequelize.define("CarRaceRewardConfig", {
  assetId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: {
      model: "GameAssetStoreRaces",
      key: "id"
    }
  },
  winSbp: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    defaultValue: "0.0",
    get() {
      return new Decimal(this.getDataValue("winSbp") || 0);
    }
  }
}, {
  tableName: "CarRaceRewardConfigs",
  timestamps: true,
});






module.exports = CarRaceRewardConfig;

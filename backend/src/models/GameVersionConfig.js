// apps/backend-api/src/models/GameVersionConfig.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const GameVersionConfig = sequelize.define("GameVersionConfig", {
  minVersion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  latestVersion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  forceUpdate: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  tableName: "GameVersionConfigs",
  timestamps: true,
});

module.exports = GameVersionConfig;

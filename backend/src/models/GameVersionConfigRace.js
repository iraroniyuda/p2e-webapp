const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const GameVersionConfigRace = sequelize.define("GameVersionConfigRace", {
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
  tableName: "GameVersionConfigRaces",
  timestamps: true,
});

module.exports = GameVersionConfigRace;

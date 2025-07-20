const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserRaceWinCounter = sequelize.define("UserRaceWinCounter", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  assetId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  raceCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  winCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  cycleNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  maxRaceCount: {   // <---- field baru: N
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5, // default boleh diatur bebas
  },
}, {
  tableName: "UserRaceWinCounters",
  timestamps: true,
});

module.exports = UserRaceWinCounter;

// models/UserRaceResult.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const RaceSession = require("./RaceSession");

const UserRaceResult = sequelize.define("UserRaceResult", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  assetId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  time: {
    type: DataTypes.FLOAT, // <- pastikan ini FLOAT
    allowNull: false,
  },
  earnedPoints: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  raceSessionId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "done", "forfeit", "abandoned"),
    allowNull: false,
    defaultValue: "pending"
  },


}, {
  tableName: "UserRaceResults",
  timestamps: true,
});

UserRaceResult.belongsTo(RaceSession, {
  foreignKey: "raceSessionId",
  targetKey: "id",
  as: "RaceSession"
});

module.exports = UserRaceResult;

// models/RaceSession.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RaceSession = sequelize.define("RaceSession", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, // Auto-generate UUID
    primaryKey: true,
  },
  trackName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mode: {
    type: DataTypes.ENUM("practice", "race", "championship"),
    allowNull: false,
  },
  totalPlayers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  totalBots: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: "RaceSessions",
  timestamps: true,
});

module.exports = RaceSession;

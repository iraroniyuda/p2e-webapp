const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const RaceTournament = sequelize.define("RaceTournament", {
  organizerId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  prizePool: { type: DataTypes.BIGINT, defaultValue: 0 },
  currency: { type: DataTypes.ENUM("SBP", "TBP", "RACE"), defaultValue: "RACE" },
  status: {
    type: DataTypes.ENUM("upcoming", "ongoing", "completed", "cancelled"),
    defaultValue: "upcoming",
  },
  participantLimit: { type: DataTypes.INTEGER, defaultValue: 16 },
  startTime: { type: DataTypes.DATE },
  endTime: { type: DataTypes.DATE },
}, {
  tableName: "RaceTournaments",
  timestamps: true,
});

User.hasMany(RaceTournament, { foreignKey: "organizerId", as: "organizedTournaments" });
RaceTournament.belongsTo(User, { foreignKey: "organizerId", as: "organizer" });

module.exports = RaceTournament;

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Championship = require("../models/Championship");
const User = require("../models/User");

const ChampionshipParticipant = sequelize.define("ChampionshipParticipant", {
  championshipId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Championships", key: "id" },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Users", key: "id" },
  },
  status: {
    type: DataTypes.ENUM("pending", "approved", "rejected"),
    defaultValue: "pending",
  },
  isReady: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  paidAmount: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    defaultValue: "0",
  },

  paidCurrency: {
    type: DataTypes.STRING, // "sbp" | "race"
    allowNull: false,
  },

}, {
  tableName: "ChampionshipParticipants",
  timestamps: true,
});

// ✅ Tambahkan relasi di sini
// Di ChampionshipParticipant.js
ChampionshipParticipant.belongsTo(User, { foreignKey: "userId", as: "user" });
ChampionshipParticipant.belongsTo(Championship, { foreignKey: "championshipId", as: "championship" });

module.exports = ChampionshipParticipant;

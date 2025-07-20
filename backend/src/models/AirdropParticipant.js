const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AirdropParticipant = sequelize.define("AirdropParticipant", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  scheduleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
    defaultValue: "PENDING",
  },
}, {
  tableName: "AirdropParticipants",
  timestamps: true,
});

module.exports = AirdropParticipant;

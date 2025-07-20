const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");


const ChampionshipRequest = sequelize.define("ChampionshipRequest", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Users", key: "id" },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "approved", "rejected"),
    defaultValue: "pending",
  }
}, {
  tableName: "ChampionshipRequests",
  timestamps: true,
});


module.exports = ChampionshipRequest;

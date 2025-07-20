const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RaceBalance = sequelize.define("RaceBalance", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: "Users",
      key: "id",
    },
  },
  balance: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: "RaceBalances",
  timestamps: true,
});

module.exports = RaceBalance;

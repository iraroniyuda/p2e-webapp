const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RaceTransaction = sequelize.define("RaceTransaction", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("earn", "spend", "reward", "convert", "admin_adjust"),
    allowNull: false,
  },
  amount: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  balanceBefore: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  balanceAfter: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  reference: {
    type: DataTypes.STRING,
  },
  note: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: "RaceTransactions",
  timestamps: true,
});

module.exports = RaceTransaction;

// models/SbpToTbpHistory.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");

const SbpToTbpHistory = sequelize.define("SbpToTbpHistory", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
  },

  sbpAmount: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    get() {
      const raw = this.getDataValue("sbpAmount");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  tbpAmount: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    get() {
      const raw = this.getDataValue("tbpAmount");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  conversionRate: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: "Format rasio seperti '1000:5' artinya 1000 SBP → 5 TBP",
  },
  txHash: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: "Hash transaksi TBP",
  },

  status: {
    type: DataTypes.ENUM("pending", "pending_confirm", "success", "failed"),
    allowNull: false,
    defaultValue: "pending",
  },


}, {
  tableName: "SbpToTbpHistories",
  timestamps: true,
});

module.exports = SbpToTbpHistory;

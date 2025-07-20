const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");

const SbpBurnLog = sequelize.define("SbpBurnLog", {
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  amount: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    get() {
      const rawValue = this.getDataValue("amount");
      return rawValue ? new Decimal(rawValue) : new Decimal(0);
    },
  },

  note: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: "SbpBurnLogs",
  timestamps: true,
});

module.exports = SbpBurnLog;

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");

const SbpAllocationTransferLog = sequelize.define("SbpAllocationTransferLog", {
  fromCategory: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  toCategory: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  amount: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    get() {
      const raw = this.getDataValue("amount");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  note: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: "SbpAllocationTransferLogs",
  timestamps: true,
});

module.exports = SbpAllocationTransferLog;

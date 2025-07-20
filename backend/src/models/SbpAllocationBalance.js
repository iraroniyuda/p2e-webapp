const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");

const SbpAllocationBalance = sequelize.define("SbpAllocationBalance", {
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  amount: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    defaultValue: "0",
    get() {
      const rawValue = this.getDataValue("amount");
      return rawValue ? new Decimal(rawValue) : new Decimal(0);
    }
  },
}, {
  tableName: "SbpAllocationBalances",
  timestamps: true,
});

module.exports = SbpAllocationBalance;

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");

const SbpToTbpConversionRate = sequelize.define("SbpToTbpConversionRate", {
  sbpAmount: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    comment: "SBP input",
    get() {
      const raw = this.getDataValue("sbpAmount");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },
  tbpAmount: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    comment: "TBP output",
    get() {
      const raw = this.getDataValue("tbpAmount");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },
}, {
  tableName: "SbpToTbpConversionRates",
  timestamps: true,
});

module.exports = SbpToTbpConversionRate;

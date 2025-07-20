const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");

const decimalField = (field) => ({
  type: DataTypes.DECIMAL(30, 18),
  allowNull: true,
  get() {
    const raw = this.getDataValue(field);
    return raw ? new Decimal(raw) : new Decimal(0);
  }
});

const ManualTopupConfig = sequelize.define("ManualTopupConfig", {
  fromType: {
    type: DataTypes.ENUM("company", "user_exchanger"),
    allowNull: false,
  },
  toType: {
    type: DataTypes.ENUM("user_exchanger", "user_regular"),
    allowNull: false,
  },

  // 💰 Rupiah tetap INTEGER
  priceRupiah: { type: DataTypes.INTEGER, allowNull: true },
  valueRupiah: { type: DataTypes.INTEGER, allowNull: true },

  // 🪙 Semua token pakai DECIMAL
  priceSBP: decimalField("priceSBP"),
  priceRACE: decimalField("priceRACE"),
  priceTBP: decimalField("priceTBP"),

  obtainedSBP: decimalField("obtainedSBP"),
  obtainedRACE: decimalField("obtainedRACE"),
  obtainedTBP: decimalField("obtainedTBP"),

  valueSBP: decimalField("valueSBP"),
  valueRACE: decimalField("valueRACE"),
  valueTBP: decimalField("valueTBP"),

  bonusDescription: { type: DataTypes.TEXT, allowNull: true },

  exchangerId: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: "ManualTopupConfig",
  timestamps: true,
});

module.exports = ManualTopupConfig;

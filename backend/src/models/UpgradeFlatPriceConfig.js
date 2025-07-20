const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");

const UpgradeFlatPriceConfig = sequelize.define("UpgradeFlatPriceConfig", {
  partType: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  price: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("price");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },
  valueSBP: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("valueSBP");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },
  // 🆕 Durability maksimal (misal: 100)
  defaultDurability: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100,
  },
}, {
  tableName: "UpgradeFlatPriceConfigs",
  timestamps: true,
});


module.exports = UpgradeFlatPriceConfig;

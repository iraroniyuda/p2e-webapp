const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");

const CircuitOwnerPackage = sequelize.define("CircuitOwnerPackage", {
  name: {
    type: DataTypes.ENUM("silver", "gold", "platinum", "diamond"),
    allowNull: false,
  },

  priceSBP: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("priceSBP");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  cashbackSBP: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("cashbackSBP");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  tableName: "CircuitOwnerPackages",
  timestamps: true,
});

module.exports = CircuitOwnerPackage;

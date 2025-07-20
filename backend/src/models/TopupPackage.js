const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");

const TopupPackage = sequelize.define("TopupPackage", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // 💰 Tetap pakai INTEGER
  priceRupiah: DataTypes.INTEGER,
  valueRupiah: DataTypes.INTEGER,

  // 🪙 Ganti semua token-related jadi DECIMAL
  priceSBP: {
    type: DataTypes.DECIMAL(30, 18),
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("priceSBP");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },
  priceRACE: {
    type: DataTypes.DECIMAL(30, 18),
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("priceRACE");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },
  priceTBP: {
    type: DataTypes.DECIMAL(30, 18),
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("priceTBP");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  obtainedSBP: {
    type: DataTypes.DECIMAL(30, 18),
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("obtainedSBP");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },
  obtainedRACE: {
    type: DataTypes.DECIMAL(30, 18),
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("obtainedRACE");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },
  obtainedTBP: {
    type: DataTypes.DECIMAL(30, 18),
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("obtainedTBP");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  valueSBP: {
    type: DataTypes.DECIMAL(30, 18),
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("valueSBP");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },
  valueRACE: {
    type: DataTypes.DECIMAL(30, 18),
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("valueRACE");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },
  valueTBP: {
    type: DataTypes.DECIMAL(30, 18),
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("valueTBP");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  bonusDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  soldBy: {
    type: DataTypes.ENUM("company", "exchanger"),
    allowNull: false,
    defaultValue: "company",
  },
  levelName: {
    type: DataTypes.ENUM("green", "blue", "double_blue"),
    allowNull: true,
  },


  exchangerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: "TopupPackages",
  timestamps: true,
});

module.exports = TopupPackage;

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");

const SbpPool = sequelize.define("SbpPool", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    defaultValue: 1, // hanya satu baris
  },

  totalMinted: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("totalMinted");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  totalBurned: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("totalBurned");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  totalTransferred: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("totalTransferred");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  totalMined: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("totalMined");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  airdropped: {
    type: DataTypes.DECIMAL(30, 18),
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("airdropped");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  staked: {
    type: DataTypes.DECIMAL(30, 18),
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("staked");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  sale: {
    type: DataTypes.DECIMAL(30, 18),
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("sale");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  bonus: {
    type: DataTypes.DECIMAL(30, 18),
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("bonus");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

}, {
  tableName: "SbpPools",
  timestamps: true,
});

module.exports = SbpPool;

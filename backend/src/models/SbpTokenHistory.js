const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");

const SbpTokenHistory = sequelize.define("SbpTokenHistory", {
  type: {
    type: DataTypes.ENUM(
      "mint", "burn", "price-update", "transfer", "deduct",
      "sale", "bonus", "mining", "airdrop", "staking"
    ),
    allowNull: false,
  },

  minted: {
    type: DataTypes.DECIMAL(30, 18),
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("minted");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  burned: {
    type: DataTypes.DECIMAL(30, 18),
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("burned");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  transferred: {
    type: DataTypes.DECIMAL(30, 18),
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("transferred");
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

  totalSupply: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: true,
    get() {
      const raw = this.getDataValue("totalSupply");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  mined: {
    type: DataTypes.DECIMAL(30, 18),
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("mined");
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

  note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

}, {
  tableName: "SbpTokenHistories",
  timestamps: true,
});

module.exports = SbpTokenHistory;

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");

const BonusConfig = sequelize.define("BonusConfig", {
  userLevel: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  transactionType: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  isOneTime: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },

  bonusAsset: {
    type: DataTypes.ENUM("RACE", "SBP", "TBP", "IDR"),
    allowNull: true,
  },

  method: {
    type: DataTypes.ENUM("flat", "percent"),
    allowNull: false,
  },

  // ✅ Wajib DECIMAL untuk presisi tinggi
  value: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    get() {
      const raw = this.getDataValue("value");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  basedOn: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  basedOnGenerational: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: "Dasar kalkulasi untuk bonus generasi (referralBonuses)",
  },

  generation: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  referralBonuses: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },

  exclusiveGroup: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  exclusiveGroupScope: {
    type: DataTypes.ENUM("bonusOnly", "configAll"),
    allowNull: true,
  },
}, {
  tableName: "BonusConfigs",
  timestamps: true,
});

module.exports = BonusConfig;

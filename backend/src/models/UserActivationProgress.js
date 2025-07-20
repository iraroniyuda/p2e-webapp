const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");

const UserActivationProgress = sequelize.define("UserActivationProgress", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  requiredSBP: {
    type: DataTypes.DECIMAL,
    defaultValue: 0,
    get() {
      const raw = this.getDataValue("requiredSBP");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },
  sbpToTbpDone: {
    type: DataTypes.DECIMAL,
    defaultValue: 0,
    get() {
      const raw = this.getDataValue("sbpToTbpDone");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },
  requiredTBP: {
    type: DataTypes.DECIMAL,
    defaultValue: 0,
    get() {
      const raw = this.getDataValue("requiredTBP");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },
  tbpToRaceDone: {
    type: DataTypes.DECIMAL,
    defaultValue: 0,
    get() {
      const raw = this.getDataValue("tbpToRaceDone");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },
  isReady: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isActivated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  activatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  userLevelToGrant: {
    type: DataTypes.ENUM("green", "blue", "double_blue"),
    allowNull: false,
  },
  packageName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  packageId: {
    type: DataTypes.INTEGER,
    allowNull: true, // atau false jika ingin wajib
  },

}, {
  tableName: "UserActivationProgresses",
  timestamps: true,
});

module.exports = UserActivationProgress;

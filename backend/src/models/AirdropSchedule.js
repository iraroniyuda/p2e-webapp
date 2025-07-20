const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");

const AirdropSchedule = sequelize.define("AirdropSchedule", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  description: DataTypes.TEXT,

  // ✅ Ganti ke DECIMAL
  amountPerUser: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    get() {
      const raw = this.getDataValue("amountPerUser");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  totalQuota: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  deadline: {
    type: DataTypes.DATE,
    allowNull: false,
  },

  source: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  isClosed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: "AirdropSchedules",
  timestamps: true,
});

module.exports = AirdropSchedule;

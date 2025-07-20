const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");

const DailyAirdropClaimLog = sequelize.define("DailyAirdropClaimLog", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },

  sbpReceived: {
    type: DataTypes.DECIMAL(30, 18),
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("sbpReceived");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },
}, {
  tableName: "DailyAirdropClaimLogs",
  timestamps: true,
  indexes: [
    { fields: ["userId", "date"], unique: true },
  ]
});

module.exports = DailyAirdropClaimLog;

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");

const DailyAirdropConfig = sequelize.define("DailyAirdropConfig", {
  minTransactionAmount: {
    type: DataTypes.INTEGER,
    defaultValue: 15000,
    comment: "Minimal transaksi selama periode untuk bisa klaim",
  },

  periodDays: {
    type: DataTypes.INTEGER,
    defaultValue: 20,
    comment: "Periode hari terakhir untuk evaluasi transaksi",
  },

  sbpReward: {
    type: DataTypes.DECIMAL(30, 18),
    defaultValue: "1",
    comment: "SBP per hari login (belum diklaim)",
    get() {
      const raw = this.getDataValue("sbpReward");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  requiredLoginDays: {
    type: DataTypes.INTEGER,
    defaultValue: 7,
    comment: "Jumlah hari login untuk bisa klaim",
  },
}, {
  tableName: "DailyAirdropConfigs",
  timestamps: true,
});



module.exports = DailyAirdropConfig;

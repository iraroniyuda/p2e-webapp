const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");

const SbpSaleHistory = sequelize.define("SbpSaleHistory", {
  fromUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  toUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  // ✅ ubah ke decimal untuk support SBP fraksional
  sbpAmount: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    get() {
      const raw = this.getDataValue("sbpAmount");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  // 💰 tetap integer karena rupiah
  priceRupiah: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "Total rupiah dibayar user",
  },

  // ✅ ubah ke DECIMAL agar persen lebih akurat
  feePercent: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    defaultValue: "0",
    comment: "Persen potongan untuk perusahaan",
    get() {
      const raw = this.getDataValue("feePercent");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  bonusPercent: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    defaultValue: "0",
    comment: "Persen bonus untuk exchanger",
    get() {
      const raw = this.getDataValue("bonusPercent");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  finalAmountToExchanger: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "Rupiah bersih diterima exchanger",
  },

  note: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: "SbpSaleHistories",
  timestamps: true,
});

module.exports = SbpSaleHistory;

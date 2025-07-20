const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");

const UserBalance = sequelize.define("UserBalance", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: "Users",
      key: "id",
    },
  },

  // 🔁 Ubah ke DECIMAL(30, 18)
  sbp: {
    type: DataTypes.DECIMAL(30, 18),
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("sbp");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  race: {
    type: DataTypes.DECIMAL(30, 18),
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("race");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  // 💰 Tetap BIGINT untuk rupiah
  rupiah: {
    type: DataTypes.BIGINT,
    defaultValue: 0,
    get() {
      return Number(this.getDataValue("rupiah"));
    },
  },

  rupiahForSell: {
    type: DataTypes.BIGINT,
    defaultValue: 0,
    get() {
      return Number(this.getDataValue("rupiahForSell"));
    },
    comment: "Jumlah rupiah yang siap dilepas oleh exchanger untuk dibeli user dengan TBP",
  },


  tbp: {
    type: DataTypes.DECIMAL(30, 18),
    defaultValue: "0",
    comment: "TBP yang dimiliki user, tapi belum diklaim ke onchain",
    get() {
      const raw = this.getDataValue("tbp");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  claimedTbp: {
    type: DataTypes.DECIMAL(30, 18),
    defaultValue: "0",
    comment: "TBP yang sudah diklaim dan dikirim ke onchain",
    get() {
      const raw = this.getDataValue("claimedTbp");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  sbpForSale: {
    type: DataTypes.DECIMAL(30, 18),
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("sbpForSale");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  sbpAvailable: {
    type: DataTypes.DECIMAL(30, 18),
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("sbpAvailable");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },
}, {
  tableName: "UserBalances",
  timestamps: true,
});


module.exports = UserBalance;

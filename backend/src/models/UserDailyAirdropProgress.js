const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");
const DailyAirdropConfig = require("../models/DailyAirdropConfig");


const UserDailyAirdropProgress = sequelize.define("UserDailyAirdropProgress", {
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },

  loginStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: "Jumlah hari login akumulatif",
  },

  lastLoginDate: {
    type: DataTypes.DATEONLY,
    comment: "Tanggal terakhir login",
  },

  pendingSbp: {
    type: DataTypes.DECIMAL(30, 18),
    defaultValue: "0",
    comment: "SBP yang belum diklaim",
    get() {
      const raw = this.getDataValue("pendingSbp");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },
}, {
  tableName: "UserDailyAirdropProgresses",
  timestamps: true,
});


module.exports = UserDailyAirdropProgress;
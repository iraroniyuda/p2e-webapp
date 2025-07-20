const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");
const User = require("./User");

const TbpToRupiahConversionLog = sequelize.define("TbpToRupiahConversionLog", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  senderUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  receiverUserId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Boleh null jika company
  },

  receiverType: {
    type: DataTypes.ENUM("company", "exchanger"),
    allowNull: false,
  },

  amountTbp: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    get() {
      const raw = this.getDataValue("amountTbp");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  amountRupiah: {
    type: DataTypes.BIGINT,
    allowNull: false,
    get() {
      return Number(this.getDataValue("amountRupiah"));
    },
  },

  txHash: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  tableName: "TbpToRupiahConversionLogs",
  timestamps: true,
});

module.exports = TbpToRupiahConversionLog;

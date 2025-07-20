const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");

/**
 * PolClaimConfig
 * Config jumlah POL yang diklaim user per level.
 * Contoh levelName: "green", "blue", "double_blue"
 */
const PolClaimConfig = sequelize.define("PolClaimConfig", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  levelName: {
    type: DataTypes.STRING(32), // enum: "green", "blue", "double_blue"
    allowNull: false,
    comment: "Nama level paket (green, blue, double_blue)",
  },

  amountPOL: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    defaultValue: "0",
    comment: "Jumlah POL yang akan diklaim user untuk level ini",
    get() {
      const raw = this.getDataValue("amountPOL");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

}, {
  tableName: "PolClaimConfigs",
  timestamps: true,
});

module.exports = PolClaimConfig;

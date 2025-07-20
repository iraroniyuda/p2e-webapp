const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");

const SbpAllocationConfig = sequelize.define("SbpAllocationConfig", {
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  percent: {
    type: DataTypes.DECIMAL(6, 4),
    allowNull: false,
    get() {
      const raw = this.getDataValue("percent");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },
}, {
  tableName: "SbpAllocationConfigs",
  timestamps: true,
});

module.exports = SbpAllocationConfig;

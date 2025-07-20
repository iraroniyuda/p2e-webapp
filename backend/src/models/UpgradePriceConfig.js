const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UpgradeFlatPriceConfig = sequelize.define("UpgradeFlatPriceConfig", {
  partType: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: "UpgradeFlatPriceConfigs",
  timestamps: true,
});

module.exports = UpgradeFlatPriceConfig;

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TbpBurnRateConfig = sequelize.define("TbpBurnRateConfig", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: "Jenis rule burn rate (lihat dokumentasi)",
  },
  burnRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: "Burn rate dalam persen (misal: 15.5 = 15.5%)",
  }
}, {
  tableName: "TbpBurnRateConfigs",
  timestamps: true,
});

module.exports = TbpBurnRateConfig;

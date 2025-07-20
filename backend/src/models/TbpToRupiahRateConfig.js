const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TbpToRupiahRateConfig = sequelize.define("TbpToRupiahRateConfig", {
  type: {
    type: DataTypes.ENUM("user_to_company", "user_to_exchanger", "exchanger_to_company"),
    allowNull: false,
  },
  rate: {
    type: DataTypes.INTEGER, // Contoh: 1000 = Rp 1000 per 1 TBP
    allowNull: false,
    validate: {
      min: 1,
    },
  },
}, {
  tableName: "TbpToRupiahRateConfigs",
  timestamps: true,
});

module.exports = TbpToRupiahRateConfig;

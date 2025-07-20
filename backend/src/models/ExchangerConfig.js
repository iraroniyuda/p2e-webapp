const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ExchangerConfig = sequelize.define("ExchangerConfig", {
  level: {
    type: DataTypes.ENUM("mid", "senior", "executive"),
    allowNull: false,
  },

  // Aset bonus (SBP, RACE, TBP, atau IDR)
  bonusAsset: {
    type: DataTypes.ENUM("SBP", "RACE", "TBP", "IDR"),
    allowNull: true,
  },

  // Nilai bonus dalam persen (%)
  bonusPercent: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },

  // Deskripsi tambahan
  bonusDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: "ExchangerConfigs",
  timestamps: true,
});

module.exports = ExchangerConfig;

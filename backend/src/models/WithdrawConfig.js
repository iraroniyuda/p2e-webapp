const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WithdrawConfig = sequelize.define('WithdrawConfig', {
  minWithdrawAmount: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    defaultValue: 10000,
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "IDR"
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Active",
  }
}, {
  tableName: 'WithdrawConfigs',
  timestamps: true, // createdAt, updatedAt
});

module.exports = WithdrawConfig;

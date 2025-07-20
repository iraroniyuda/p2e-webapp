// src/models/SignupBonusConfig.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SignupBonusConfig = sequelize.define("SignupBonusConfig", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  sbpAmount: {
    type: DataTypes.DECIMAL(30, 18),
    defaultValue: "0",
  },
}, {
  tableName: "SignupBonusConfigs",
  timestamps: true,
});

module.exports = SignupBonusConfig;

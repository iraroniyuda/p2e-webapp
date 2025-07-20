// models/SbpSourceRule.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SbpSourceRule = sequelize.define("SbpSourceRule", {
  source: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  locked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  durationDays: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: "SbpSourceRules",
  timestamps: true,
});

module.exports = SbpSourceRule;

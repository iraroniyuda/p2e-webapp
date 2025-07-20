const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const EmailVerification = sequelize.define("EmailVerification", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: "EmailVerifications",
  timestamps: true,
});

module.exports = EmailVerification;

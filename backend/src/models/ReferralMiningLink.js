const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ReferralMiningLink = sequelize.define("ReferralMiningLink", {
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "Users", key: "id" },
  },
  claimed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: "ReferralMiningLinks",
  timestamps: true,
});

const MiningClickLog = require("./MiningClickLog");

// 👇 Relasi satu arah saja cukup agar eager loading aktif
ReferralMiningLink.hasMany(MiningClickLog, { foreignKey: "referralMiningLinkId", as: "clickLogs" });

module.exports = ReferralMiningLink;

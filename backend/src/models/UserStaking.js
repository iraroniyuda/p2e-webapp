const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");

const UserStaking = sequelize.define("UserStaking", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  // ⬇️ Refactor dari BIGINT ke DECIMAL
  amount: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    get() {
      const raw = this.getDataValue("amount");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  stakeTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  unstakeTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  rewardClaimed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  lastRewardClaimedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: "Terakhir kali user klaim/compound reward",
  },

}, {
  tableName: "UserStakings",
  timestamps: true,
});

module.exports = UserStaking;

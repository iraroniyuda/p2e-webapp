const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TbpStakingConfig = sequelize.define("TbpStakingConfig", {
  rewardRate: {
    type: DataTypes.DECIMAL(30, 0),
    allowNull: false,
    defaultValue: "0",
    comment: "Reward rate per second (wei)",
  },
  minStakeTime: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: "Minimal waktu stake (detik)",
  },
  stakingCap: {
    type: DataTypes.DECIMAL(30, 0),
    allowNull: false,
    defaultValue: "0",
    comment: "Staking cap (wei)",
  },
}, {
  tableName: "TbpStakingConfigs",
  timestamps: true,
});
module.exports = TbpStakingConfig;

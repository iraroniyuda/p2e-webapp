const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");

const StakingConfig = sequelize.define("StakingConfig", {
  // ✅ Decimal untuk SBP minimum stake
  minStakeAmount: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    defaultValue: "0",
    comment: "Minimal SBP yang boleh distake",
    get() {
      const raw = this.getDataValue("minStakeAmount");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  // ✅ Decimal untuk reward per cycle
  rewardPerCycle: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    defaultValue: "0",
    comment: "Reward SBP per satuan stake per cycle",
    get() {
      const raw = this.getDataValue("rewardPerCycle");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },
  dailyRewardPercent: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: false,
    defaultValue: "0.1", // 0.1% per hari
    comment: "Persentase reward per hari (dalam %)",
    get() {
      const raw = this.getDataValue("dailyRewardPercent");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  

  // ⏳ Tetap INTEGER: waktu (tidak butuh desimal)
  cycleDurationDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 7,
    comment: "Lama durasi staking agar eligible klaim reward",
  },

  cooldownAfterUnstake: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: "Hari cooldown setelah unstake sebelum bisa stake lagi",
  },

  // ✅ Decimal untuk batas stake user
  maxStakePerUser: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: true,
    comment: "Batas maksimum stake per user (opsional)",
    get() {
      const raw = this.getDataValue("maxStakePerUser");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  // ✅ Decimal untuk batas stake global
  maxTotalStaked: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: true,
    comment: "Batas maksimum stake global (opsional)",
    get() {
      const raw = this.getDataValue("maxTotalStaked");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },
}, {
  tableName: "StakingConfigs",
  timestamps: true,
});

module.exports = StakingConfig;

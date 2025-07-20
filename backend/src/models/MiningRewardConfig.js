const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");

const MiningRewardConfig = sequelize.define("MiningRewardConfig", {
  // Tetap INTEGER karena hanya hitungan klik
  sbpPerClickGroup: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },

  // ✅ Harus DECIMAL karena menyimpan jumlah token
  sbpRewardAmount: {
    type: DataTypes.DECIMAL(30, 18),
    defaultValue: "1",
    get() {
      const raw = this.getDataValue("sbpRewardAmount");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  tbpRewardAmount: {
    type: DataTypes.DECIMAL(30, 18),
    defaultValue: "0",
    get() {
      const raw = this.getDataValue("tbpRewardAmount");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  rewardType: {
    type: DataTypes.ENUM("SBP", "TBP", "BOTH"),
    defaultValue: "SBP",
  },
}, {
  tableName: "MiningRewardConfigs",
  timestamps: true,
});

module.exports = MiningRewardConfig;

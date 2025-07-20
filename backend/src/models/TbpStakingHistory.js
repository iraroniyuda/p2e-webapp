const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");

const TbpStakingHistory = sequelize.define(
  "TbpStakingHistory",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },

    action: {
      type: DataTypes.ENUM("stake", "unstake", "claim"),
      allowNull: false,
      // Sequelize tidak akan menambah USING jika comment dikosongkan
      // Jika tetap ingin comment, jangan pakai komentar inline di define
      // Atau bisa hilangkan saja comment ini
    },

    amount: {
      type: DataTypes.DECIMAL(30, 18),
      allowNull: false,
      get() {
        const raw = this.getDataValue("amount");
        return raw ? new Decimal(raw) : new Decimal(0);
      },
    },

    txHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "TbpStakingHistories",
    timestamps: true,
    // ⛔ Jangan gunakan comment di sini kalau enum error
    // Gunakan comment via migration SQL jika butuh
  }
);

module.exports = TbpStakingHistory;

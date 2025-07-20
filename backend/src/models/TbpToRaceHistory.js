// models/TbpToRaceHistory.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");

const TbpToRaceHistory = sequelize.define("TbpToRaceHistory", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
  },

  tbpAmount: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    get() {
      const raw = this.getDataValue("tbpAmount");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  burnedAmount: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    get() {
      const raw = this.getDataValue("burnedAmount");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
    comment: "Jumlah TBP yang dibakar (burn) dari owner"
  },

  receivedAmount: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    get() {
      const raw = this.getDataValue("receivedAmount");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
    comment: "Jumlah TBP yang diterima owner (setelah burn)"
  },

  burnRate: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
    comment: "Persentase burn (misal: 0.55 = 55%)"
  },

  txHashUserToOwner: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: "Hash transfer TBP dari user ke owner"
  },

  txHashBurn: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: "Hash burn TBP dari owner ke burn address"
  },

  status: {
    type: DataTypes.ENUM("pending", "pending_burn", "success", "failed"),
    allowNull: false,
    defaultValue: "pending",
  },
}, {
  tableName: "TbpToRaceHistories",
  timestamps: true,
});

module.exports = TbpToRaceHistory;

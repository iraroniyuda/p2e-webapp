const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");

const UserPolClaimHistory = sequelize.define("UserPolClaimHistory", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
    comment: "ID user",
  },

  levelName: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: "Nama level paket saat klaim POL",
  },

  packageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "ID paket yang diklaim POL-nya",
  },

  // --- Nominal POL (decimal) + getter Decimal ---
  amountPOL: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    defaultValue: "0",
    comment: "Nominal POL yang diklaim (satuan POL, bukan wei)",
    get() {
      const raw = this.getDataValue("amountPOL");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  claimedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: "Waktu klaim POL",
  },

  txHash: {
    type: DataTypes.STRING(80),
    allowNull: false,
    comment: "Hash transaksi transfer POL ke wallet user",
  },

}, {
  tableName: "UserPolClaimHistories",
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ["userId", "levelName", "packageId"],
    }
  ]
});


const User = require("./User");
UserPolClaimHistory.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = UserPolClaimHistory;

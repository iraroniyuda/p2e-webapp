const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SbpBalance = sequelize.define("SbpBalance", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: "Users", // Nama tabel, bukan model JS
      key: "id",
    },
  },
  balance: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: "SbpBalances",
  timestamps: true,
});

// ⛔️ JANGAN .belongsTo() DI SINI
// Karena circular: User sudah require SbpBalance, jangan balik require lagi

module.exports = SbpBalance;

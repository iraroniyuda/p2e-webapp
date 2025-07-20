const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");

const SbpBalanceDetail = sequelize.define("SbpBalanceDetail", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
  },

  source: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  amount: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    get() {
      const raw = this.getDataValue("amount");
      return raw ? new Decimal(raw) : new Decimal(0);
    },
  },

  lockedUntil: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: "SbpBalanceDetails",
  timestamps: true,
});

module.exports = SbpBalanceDetail;

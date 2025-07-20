const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const CircuitRentalRace = sequelize.define("CircuitRentalRace", {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  circuitName: { type: DataTypes.STRING, allowNull: false },
  startDate: { type: DataTypes.DATE, allowNull: false },
  endDate: { type: DataTypes.DATE, allowNull: false },
  price: { type: DataTypes.BIGINT, allowNull: false },
  currency: { type: DataTypes.ENUM("SBP", "TBP"), defaultValue: "SBP" },
  status: {
    type: DataTypes.ENUM("pending", "active", "expired", "cancelled"),
    defaultValue: "pending",
  },
}, {
  tableName: "CircuitRentalRaces",
  timestamps: true,
});

User.hasMany(CircuitRentalRace, { foreignKey: "userId", as: "circuitRentals" });
CircuitRentalRace.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = CircuitRentalRace;

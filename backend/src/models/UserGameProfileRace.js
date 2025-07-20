const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const UserGameProfileRace = sequelize.define("UserGameProfileRace", {
  userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  nickname: { type: DataTypes.STRING, allowNull: false, unique: true },
  level: { type: DataTypes.INTEGER, defaultValue: 1 },
  experiencePoints: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalRace: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalWin: { type: DataTypes.INTEGER, defaultValue: 0 },
  carPartJson: { type: DataTypes.JSONB, defaultValue: {} },
  status: {
    type: DataTypes.ENUM("idle", "racing", "repairing", "banned"),
    defaultValue: "idle",
  },
}, {
  tableName: "UserGameProfileRaces",
  timestamps: true,
});

User.hasOne(UserGameProfileRace, { foreignKey: "userId", as: "raceProfile" });
UserGameProfileRace.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = UserGameProfileRace;

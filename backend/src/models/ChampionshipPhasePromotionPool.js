const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const ChampionshipPhasePromotionPool = sequelize.define("ChampionshipPhasePromotionPool", {
  championshipId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  phase: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  promotedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "ChampionshipPhasePromotionPools",
  timestamps: false,
indexes: [
  {
    name: "idx_championship_phase_user",
    fields: ["championshipId", "phase", "userId"]
  }
]

});

ChampionshipPhasePromotionPool.belongsTo(User, { foreignKey: "userId", as: "user" });
module.exports = ChampionshipPhasePromotionPool;

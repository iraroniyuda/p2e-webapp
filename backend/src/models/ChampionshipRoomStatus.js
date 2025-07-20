const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ChampionshipRoomStatus = sequelize.define("ChampionshipRoomStatus", {
  matchGroupId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: { model: "ChampionshipMatchGroups", key: "id" },
  },
  isRaceStarted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  joinedUserIds: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
}, {
  tableName: "ChampionshipRoomStatuses",
  timestamps: true,
});

// TIDAK ADA relasi di sini

module.exports = ChampionshipRoomStatus;

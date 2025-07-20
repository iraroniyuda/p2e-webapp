const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ChampionshipGroupMember = require("./ChampionshipGroupMember");
const ChampionshipRoomStatus = require("./ChampionshipRoomStatus");
const User = require("./User");

const ChampionshipMatchGroup = sequelize.define("ChampionshipMatchGroup", {
  championshipId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  phase: {
    type: DataTypes.ENUM("qualifier", "semifinal", "final", "grand_final"),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("waiting", "ongoing", "done"),
    allowNull: false,
    defaultValue: "waiting",
  },
  groupNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  tableName: "ChampionshipMatchGroups",
  timestamps: true,
});

// 🔁 Tambahkan relasi DI SINI
ChampionshipMatchGroup.hasMany(ChampionshipGroupMember, {
  foreignKey: "matchGroupId",
  as: "members",
});

ChampionshipMatchGroup.hasOne(ChampionshipRoomStatus, {
  foreignKey: "matchGroupId",
  as: "roomStatus",
});

ChampionshipGroupMember.belongsTo(ChampionshipMatchGroup, {
  foreignKey: "matchGroupId",
  as: "group",
});

ChampionshipGroupMember.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

module.exports = ChampionshipMatchGroup;

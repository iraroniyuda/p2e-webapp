const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const ChampionshipMatchGroup = require("./ChampionshipMatchGroup");
const User = require("./User");

const ChampionshipGroupMember = sequelize.define("ChampionshipGroupMember", {
  matchGroupId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  resultPosition: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  finishTime: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  isReady: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: "ChampionshipGroupMembers",
  timestamps: true,
});


require("./ChampionshipMatchGroup"); 

module.exports = ChampionshipGroupMember;

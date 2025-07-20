const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const ChampionshipRequest = require("./ChampionshipRequest");

const Championship = sequelize.define("Championship", {
  requestId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "ChampionshipRequests", key: "id" },
  },

  registrationFeeAmount: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    defaultValue: "0",
  },
  registrationFeeCurrency: {
    type: DataTypes.ENUM("SBP", "RACE", "TBP", "IDR"),
    allowNull: false,
  },

  rewardCurrency1: {
    type: DataTypes.ENUM("SBP", "RACE", "TBP", "IDR"),
    allowNull: true,
  },
  rewardAmount1: {
    type: DataTypes.DECIMAL(30, 18),
    allowNull: false,
    defaultValue: "0",
  },

  rewardCurrency2: {
    type: DataTypes.ENUM("SBP", "RACE", "TBP", "IDR"),
    allowNull: true,
  },
  rewardAmount2: {
    type: DataTypes.DECIMAL(30, 18),
    defaultValue: "0",
  },

  rewardCurrency3: {
    type: DataTypes.ENUM("SBP", "RACE", "TBP", "IDR"),
    allowNull: true,
  },
  rewardAmount3: {
    type: DataTypes.DECIMAL(30, 18),
    defaultValue: "0",
  },

  royaltyAmount: {
    type: DataTypes.DECIMAL(30, 18),
    defaultValue: "0",
  },
  royaltyCurrency: {
    type: DataTypes.ENUM("SBP", "RACE", "TBP", "IDR"),
    allowNull: true,
  },
  rewardGiven: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  royaltyGiven: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },


  status: {
    type: DataTypes.ENUM("upcoming", "ongoing", "finished", "cancelled"),
    defaultValue: "upcoming",
  }
}, {
  tableName: "Championships",
  timestamps: true,
});

Championship.belongsTo(ChampionshipRequest, {
  foreignKey: "requestId",
  as: "request",
});

ChampionshipRequest.hasOne(Championship, {
  foreignKey: "requestId",
  as: "championship",
});

module.exports = Championship;

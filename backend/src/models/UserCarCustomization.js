const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserCarCustomization = sequelize.define("UserCarCustomization", {
  userId: { type: DataTypes.INTEGER, allowNull: false, field: "userId" },
  assetId: { type: DataTypes.INTEGER, allowNull: false, field: "assetId" },

  engineLevel: { type: DataTypes.INTEGER, defaultValue: 0, field: "engineLevel" },
  enginePrice: { type: DataTypes.INTEGER, defaultValue: 0, field: "enginePrice" },

  brakeLevel: { type: DataTypes.INTEGER, defaultValue: 0, field: "brakeLevel" },
  brakePrice: { type: DataTypes.INTEGER, defaultValue: 0, field: "brakePrice" },

  handlingLevel: { type: DataTypes.INTEGER, defaultValue: 0, field: "handlingLevel" },
  handlingPrice: { type: DataTypes.INTEGER, defaultValue: 0, field: "handlingPrice" },

  speedLevel: { type: DataTypes.INTEGER, defaultValue: 0, field: "speedLevel" },
  speedPrice: { type: DataTypes.INTEGER, defaultValue: 0, field: "speedPrice" },

  spoiler: { type: DataTypes.INTEGER, defaultValue: -1, field: "spoiler" },
  spoilerPrice: { type: DataTypes.INTEGER, defaultValue: 0, field: "spoilerPrice" },

  siren: { type: DataTypes.INTEGER, defaultValue: -1, field: "siren" },
  sirenPrice: { type: DataTypes.INTEGER, defaultValue: 0, field: "sirenPrice" },

  wheel: { type: DataTypes.INTEGER, defaultValue: -1, field: "wheel" },
  wheelPrice: { type: DataTypes.INTEGER, defaultValue: 0, field: "wheelPrice" },

  neonIndex: { type: DataTypes.INTEGER, defaultValue: -1, field: "neonIndex" },
  neonPrice: { type: DataTypes.INTEGER, defaultValue: 0, field: "neonPrice" },

  decalIndexFront: { type: DataTypes.INTEGER, defaultValue: -1, field: "decalIndexFront" },
  decalIndexBack: { type: DataTypes.INTEGER, defaultValue: -1, field: "decalIndexBack" },
  decalIndexLeft: { type: DataTypes.INTEGER, defaultValue: -1, field: "decalIndexLeft" },
  decalIndexRight: { type: DataTypes.INTEGER, defaultValue: -1, field: "decalIndexRight" },
  decalPrice: { type: DataTypes.INTEGER, defaultValue: 0, field: "decalPrice" },

  paint: { type: DataTypes.STRING, defaultValue: "#000000", field: "paint" },
  paintPrice: { type: DataTypes.INTEGER, defaultValue: 0, field: "paintPrice" },

  headlightColor: { type: DataTypes.STRING, defaultValue: "#FFFFFF", field: "headlightColor" },
  headlightPrice: { type: DataTypes.INTEGER, defaultValue: 0, field: "headlightPrice" },

  wheelSmokeColor: { type: DataTypes.STRING, defaultValue: "#FFFFFF", field: "wheelSmokeColor" },
  wheelSmokePrice: { type: DataTypes.INTEGER, defaultValue: 0, field: "wheelSmokePrice" },

  cambersFront: { type: DataTypes.FLOAT, defaultValue: 0, field: "cambersFront" },
  cambersRear: { type: DataTypes.FLOAT, defaultValue: 0, field: "cambersRear" },
  suspensionDistanceFront: { type: DataTypes.FLOAT, defaultValue: 0, field: "suspensionDistanceFront" },
  suspensionDistanceRear: { type: DataTypes.FLOAT, defaultValue: 0, field: "suspensionDistanceRear" },
}, {
  tableName: "UserCarCustomizations",
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ["userId", "assetId"],
    },
  ],
});

module.exports = UserCarCustomization;

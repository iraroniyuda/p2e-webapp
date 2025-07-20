const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserOwnedCustomizationParts = sequelize.define("UserOwnedCustomizationParts", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  assetId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  partType: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  value: {
    type: DataTypes.STRING,
    allowNull: false,
  },


  durability: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100,
  },
}, {
  tableName: "UserOwnedCustomizationParts",
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ["userId", "assetId", "partType", "value"],
    },
  ],
});

module.exports = UserOwnedCustomizationParts;

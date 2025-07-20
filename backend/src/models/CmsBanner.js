const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CmsBanner = sequelize.define("CmsBanner", {
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  caption: {
    type: DataTypes.STRING,
  },
  linkUrl: {
    type: DataTypes.STRING,
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM("active", "inactive"),
    defaultValue: "active",
  },
});

module.exports = CmsBanner;

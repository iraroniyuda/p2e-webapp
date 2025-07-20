// src/models/CmsContent.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CmsContent = sequelize.define("CmsContent", {
  page: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  section: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
  },
  content: {
    type: DataTypes.TEXT,
  },
  mediaUrl: {
    type: DataTypes.TEXT,
    field: "media_url",
  },
  linkUrl: {
    type: DataTypes.TEXT,
    field: "link_url",
  },
  position: {
    type: DataTypes.INTEGER,
  }
}, {
  tableName: "CmsContent",
  timestamps: true,
  underscored: true, // penting kalau nama kolom snake_case
});

module.exports = CmsContent;

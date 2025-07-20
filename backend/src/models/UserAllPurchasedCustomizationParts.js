const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Mencatat semua part yang pernah dibeli user (tidak pernah dihapus)
const UserAllPurchasedCustomizationParts = sequelize.define(
  "UserAllPurchasedCustomizationParts",
  {
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
    // Info tambahan: tanggal beli, harga, source (opsional)
    price: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    purchasedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  },
  {
    tableName: "UserAllPurchasedCustomizationParts",
    timestamps: false, // karena sudah ada purchasedAt
    indexes: [
      {
        // GANTI nama index! (wajib beda dari yang lama!)
        name: "idx_uapcp_uid_aid_pt_val", // nama bebas, tidak boleh sama dgn yang error/nyangkut!
        fields: ["userId", "assetId", "partType", "value"],
      },
    ],
  }
);

module.exports = UserAllPurchasedCustomizationParts;

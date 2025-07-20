const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserKycRequest = sequelize.define("UserKycRequest", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "user_id",
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: "full_name",
  },
  nikNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    field: "nik_number",
  },
  dateOfBirth: {
    type: DataTypes.STRING,
    allowNull: true,
    field: "date_of_birth",
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    field: "phone_number",
  },
  walletAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    field: "wallet_address",
  },
  bankAccountNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    field: "bank_account_number",
  },
  
  // New field for bank name
  bankName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: "bank_name",
  },

  // New field for account holder name
  accountHolderName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: "account_holder_name",
  },

  idCardImageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: "id_card_image_url",
  },
  
  // Removed selfieImageUrl

  status: {
    type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
    defaultValue: "PENDING",
  },
  reasonRejected: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: "reason_rejected",
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "submitted_at",
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "reviewed_at",
  },
  reviewedByAdminId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: "reviewed_by_admin_id",
  },
}, {
  tableName: "UserKycRequest",
  timestamps: true,
});

module.exports = UserKycRequest;

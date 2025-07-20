const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const TopupPackage = require('./TopupPackage');

const UserTransaction = sequelize.define('UserTransaction', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM(
      'TOPUP',
      'WITHDRAWAL',
      'WITHDRAWAL_INQUIRY',
      'WITHDRAWAL_ADMIN_INQUIRY',
      'WITHDRAWAL_ADMIN'
    ),
    allowNull: false,
  },


  amount: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'PENDING',
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isApplied: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  method: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  responseDesc: {
    type: DataTypes.STRING(1000),
    allowNull: true,
  },
  rawStatusCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  exchangerId: {
  type: DataTypes.INTEGER,
  allowNull: true,
  },
  soldBy: {
    type: DataTypes.ENUM("company", "exchanger"),
    allowNull: true,
  },
  packageId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'TopupPackages',
      key: 'id',
    },
  }
}, {
  tableName: 'UserTransaction',
  timestamps: true,
});

// ✅ Relasi hanya didefinisikan di sini
UserTransaction.belongsTo(TopupPackage, {
  foreignKey: 'packageId',
  as: 'topupPackage',
});

module.exports = UserTransaction;

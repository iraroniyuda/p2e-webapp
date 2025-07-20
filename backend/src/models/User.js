const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const UserTransaction = require("./UserTransaction");
const EmailVerification = require("./EmailVerification");
const UserKycRequest = require('./UserKycRequest');
const UserBalance = require("./UserBalance");
const SbpSaleHistory = require("./SbpSaleHistory")
const UserActivationProgress = require("./UserActivationProgress");
const AirdropParticipant = require("./AirdropParticipant");
const ReferralMiningLink = require("./ReferralMiningLink");
const MiningClickLog = require("./MiningClickLog");
const UserStaking = require("./UserStaking");
const ChampionshipRequest = require("./ChampionshipRequest");
const TbpToRupiahConversionLog = require("./TbpToRupiahConversionLog");


const User = sequelize.define(
  "User",
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 100],
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
      },
    },
    referralCode: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    referredById: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    wallet: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
    },
    bankAccountNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
    },

    role: {
      type: DataTypes.ENUM(
        "user",
        "customer service",
        "admin"
      ),
      defaultValue: "user",
    },

    userLevel: {
      type: DataTypes.ENUM("white", "green", "blue", "double_blue"),
      defaultValue: "white",
    },

    exchangerLevel: {
      type: DataTypes.ENUM("none", "mid", "senior", "executive"),
      defaultValue: "none",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isBannedRace: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isBannedSubmarine: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isBannedCombat: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isCompanyExchanger: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    circuitOwnerLevel: {
      type: DataTypes.ENUM("none", "company", "silver", "gold", "platinum", "diamond"),
      allowNull: false,
      defaultValue: "none",
    },

    isSuspended: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    selectedCarAssetId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    }

  },
  {
    tableName: "Users",
    timestamps: true,
    paranoid: true,
  }
);


User.hasMany(UserTransaction, { foreignKey: "userId", as: "transactions" });
UserTransaction.belongsTo(User, { foreignKey: "userId", as: "user" });
UserTransaction.belongsTo(User, { foreignKey: "exchangerId", as: "exchanger" });

User.hasOne(EmailVerification, { foreignKey: "userId", as: "emailVerification" });
EmailVerification.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(UserKycRequest, { foreignKey: 'user_id', as: 'kycRequests' });
UserKycRequest.belongsTo(User, { foreignKey: 'user_id', as: 'user' });



User.hasOne(UserBalance, { foreignKey: "userId", as: "balance" });
UserBalance.belongsTo(User, { foreignKey: "userId", as: "user" });



User.hasMany(AirdropParticipant, { foreignKey: "userId", as: "airdrops" });
AirdropParticipant.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(SbpSaleHistory, { foreignKey: "fromUserId", as: "salesMade" });
User.hasMany(SbpSaleHistory, { foreignKey: "toUserId", as: "salesReceived" });
SbpSaleHistory.belongsTo(User, { foreignKey: "fromUserId", as: "seller" });
SbpSaleHistory.belongsTo(User, { foreignKey: "toUserId", as: "buyer" });



User.hasMany(ReferralMiningLink, { foreignKey: "userId", as: "miningLinks" });
ReferralMiningLink.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(UserStaking, { foreignKey: "userId", as: "stakings" });
UserStaking.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasOne(UserActivationProgress, { foreignKey: "userId" });
UserActivationProgress.belongsTo(User, { foreignKey: "userId" });

User.hasMany(ChampionshipRequest, { as: "championshipRequests", foreignKey: "userId" });
ChampionshipRequest.belongsTo(User, { as: "user", foreignKey: "userId" });

User.hasMany(TbpToRupiahConversionLog, { foreignKey: "receiverUserId", as: "receivedConversions" });
TbpToRupiahConversionLog.belongsTo(User, { foreignKey: "receiverUserId", as: "receiver" });

User.hasMany(TbpToRupiahConversionLog, { foreignKey: "senderUserId", as: "sentConversions" });
TbpToRupiahConversionLog.belongsTo(User, { foreignKey: "senderUserId", as: "sender" });

User.belongsTo(User, { as: "referrer", foreignKey: "referredById" });
User.hasMany(User, { as: "referrals", foreignKey: "referredById" });

module.exports = User;

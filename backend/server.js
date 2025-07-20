require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env.production" : ".env.local",
});

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const sequelize = require("./src/config/database");
const app = express();
const PORT = process.env.PORT || 3000;

//
// 🗂 Import All Models

require("./src/models/UserTransaction");
require("./src/models/ReferralSettings");
require("./src/models/EmailVerification");
require("./src/models/UserKycRequest");
require("./src/models/SbpTokenHistory");
require("./src/models/TopupPackage");
require("./src/models/BonusConfig");
require("./src/models/UserBalance");
require("./src/models/GameVersionConfigRace");
require("./src/models/ManualTopupConfig");
require("./src/models/ExchangerConfig");

require("./src/models/SbpPool");
require("./src/models/SbpAllocationConfig");
require("./src/models/SbpAllocationBalance");
require("./src/models/SbpAllocationTransferLog");
require("./src/models/SbpBurnLog");
require("./src/models/ReferralMiningLink");
require("./src/models/MiningClickLog");
require("./src/models/MiningRewardConfig");
require("./src/models/DailyAirdropConfig");
require("./src/models/DailyAirdropClaimLog");
require("./src/models/UserActivationProgress");





//
// 📂 Serve Static Folder
app.use('/images', express.static(path.join(__dirname, 'public')));





//
// 🔐 Setup CORS dinamis
const allowedOrigins = [
  "",
  "", // ⬅️ tambahkan ini
  "http://localhost:3001",
];


app.use(
  cors({
    origin: function (origin, callback) {
      // ✅ Jika origin tidak ada (null/undefined), tetap diizinkan (Trustwallet Mobile)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("❌ Origin tidak diizinkan oleh CORS:", origin);
        callback(null, false); // jangan lempar error, cukup tolak
      }
    },
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


//
// 🔧 Middleware Umum
//
// 🔧 Middleware Umum (gunakan default)
app.use(cookieParser());
app.use(express.json()); // default 100kb
app.use(express.urlencoded({ extended: true })); // default size limit juga cukup



//
// 🚏 API Routes
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/referral", require("./src/routes/referralRoutes"));
app.use("/api/admin", require("./src/routes/adminRoutes"));
app.use("/api/admin/token", require("./src/routes/tokenRoutes"));
app.use("/api/payment", require("./src/routes/paymentRoutes"));
app.use("/api/callback", require("./src/routes/callbackRoutes"));

//app.use("/api/admin/kyc", require("./src/routes/adminKycRoutes"));
app.use("/api/admin/sbp", require("./src/routes/adminSbpRoutes"));
app.use("/api/admin/race", require("./src/routes/adminRaceRoutes"));
app.use("/api/admin/topup", require("./src/routes/adminTopupRoutes"));
app.use("/api/admin/bonus-config", require("./src/routes/adminBonusRoutes"));
app.use("/api/user/balance", require("./src/routes/userBalanceRoutes"));
app.use("/api/admin/cms", require("./src/routes/adminCmsRoutes"));
app.use("/api/cms", require("./src/routes/publicCmsRoutes"));
app.use("/api/admin/sbp-source-rules", require("./src/routes/adminSbpSourceRoutes"));
app.use("/api/admin/airdrop", require("./src/routes/adminAirdropRoutes"));
app.use("/api/airdrop", require("./src/routes/airdropUserRoutes"));
app.use("/api/version", require("./src/routes/versionRoutes"));
app.use("/api/admin/topup-config", require("./src/routes/adminManualTopupConfigRoutes"));
app.use("/api", require("./src/routes/manualTopupPublicRoutes"));
app.use("/api/exchanger", require("./src/routes/exchangerRoutes"));
app.use("/api/admin/exchanger", require("./src/routes/adminExchangerRoutes"));
app.use("/api/admin/exchanger-config", require("./src/routes/adminExchangerConfigRoutes"));
app.use("/api/utils", require("./src/routes/proxyRoutes"));
app.use("/api/mining", require("./src/routes/userMiningRoutes"));
app.use("/api/admin/mining", require("./src/routes/adminMiningRoutes"));
app.use("/api/daily-airdrop", require("./src/routes/dailyAirdropRoutes"));
app.use("/api/admin/staking", require("./src/routes/adminStakingRoutes"));
app.use("/api/staking", require("./src/routes/userStakingRoutes"));
app.use("/api", require("./src/routes/conversionRatePublicRoutes"));
app.use("/api/admin", require("./src/routes/conversionRateAdminRoutes"));
app.use("/api/game", require("./src/routes/raceGameRoutes"));
app.use("/api/admin/user-inventory", require("./src/routes/adminUserInventoryRoutes"));
app.use("/api/admin", require("./src/routes/adminUserRoutes"));
app.use("/api/game", require("./src/routes/raceInventoryRoutes"));
app.use("/api", require("./src/routes/userCarCustomizationRoutes"));
app.use("/api/race", require("./src/routes/raceResultRoutes"));
app.use("/api/admin", require("./src/routes/adminCarPriceRoutes"));
app.use("/api/admin/race-entry-fee", require("./src/routes/adminCarRaceEntryFeeRoutes"));
app.use("/api/admin", require("./src/routes/adminRaceReferralBonusRoutes"));
app.use("/api/admin/circuit-owners", require("./src/routes/adminCircuitOwnerRoutes"));
app.use("/api/public/circuit-owner-packages", require("./src/routes/userCircuitOwnerRoutes"));
app.use("/api/admin/circuit-owner-packages", require("./src/routes/adminCircuitPackageRoutes"));
app.use("/api/championship", require("./src/routes/championshipEnrollmentRoutes"));
app.use("/api/championship/gameplay", require("./src/routes/championshipGameplayRoutes"));
app.use("/api", require("./src/routes/activationRoutes"));
app.use("/api/admin/race-reward", require("./src/routes/adminRaceRewardRoutes"));
app.use("/api/game", require("./src/routes/publicRewardRoutes"));
app.use("/api/game", require("./src/routes/publicRaceFeeRoutes"));
app.use("/api/admin/tbp-exchange-rate", require("./src/routes/tbpExchangeRateRoutes"));
app.use("/api/user", require("./src/routes/userRoutes"));
app.use("/api/referral-signup", require("./src/routes/referralSignupBonusRoutes"));
app.use("/api/signup-bonus", require("./src/routes/signupBonusConfigRoutes"));
app.use("/api/user/referral-signup", require("./src/routes/referralSignupBonusUserRoutes"));
app.use("/api/kyc", require("./src/routes/kycRoutes"));
app.use("/api/admin/withdraw-config", require("./src/routes/adminWithdrawConfigRoutes"));
app.use("/api", require("./src/routes/polClaimRoutes"));
app.use("/api/admin/pol-claim-config", require("./src/routes/adminPolClaimConfigRoutes"));
app.use("/api/user", require("./src/routes/userTbpBurnRateRoutes"));
app.use("/api/admin/pol-claim-histories", require("./src/routes/adminPolClaimHistoryRoutes"));
app.use("/api/admin", require("./src/routes/adminWithdrawalHistoryRoutes"));
app.use("/api/admin", require("./src/routes/adminWithdrawRoutes"));
app.use("/api/user/token", require("./src/routes/userTokenRoutes"));
app.use("/api/staking", require("./src/routes/tbpStakingHistoryRoutes"));

//
// 🚀 Jalankan server setelah DB terhubung
(async () => {
  try {
    await sequelize.authenticate();


    await sequelize.sync({ alter: true });


    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
})();

const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const {
  getUserBalance,
  getUserSbpDetail,
  updateSbpForSale,
  claimTbp,
  convertSbpToTbp,
  convertTbpToRace,
  getSbpToTbpHistory,
  updateRupiahForSale,
  convertTbpToRupiah,
  getTbpToRupiahHistory,
  requestSbpToTbp,
  confirmSbpToTbp,
  getTbpToRaceHistory,
} = require("../controllers/userBalanceController");

const {
  convertRupiahToSbp,
  getRupiahToSbpHistory,
} = require("../controllers/convertRupiahtoSbpController");
const ManualTopupConfig = require("../models/ManualTopupConfig");
const SbpBalanceDetail = require("../models/SbpBalanceDetail");



const { verifyToken } = require("../middlewares/authMiddleware");
const { requireKycApproved } = require("../middlewares/kycMiddleware");

// 🔐 Ambil saldo utama
router.get("/", verifyToken, requireKycApproved, getUserBalance);

// 🔐 Ambil detail SBP + ringkasan
router.get("/sbp-detail", verifyToken, requireKycApproved, getUserSbpDetail);

// 🔐 Exchanger update SBP yang dijual
router.post("/exchanger/sbp-for-sale", verifyToken, updateSbpForSale);

// 🔐 Klaim TBP onchain (butuh KYC)
router.post("/claim-tbp", verifyToken, requireKycApproved, claimTbp);

router.post("/convert-sbp-to-tbp", verifyToken, requireKycApproved, convertSbpToTbp);

router.post("/convert-tbp-to-race", verifyToken, requireKycApproved, convertTbpToRace);

router.post("/convert-rupiah-to-sbp", verifyToken, requireKycApproved, convertRupiahToSbp);
router.post("/convert-tbp-to-rupiah", verifyToken, convertTbpToRupiah);
router.get("/convert-tbp-to-rupiah/history", verifyToken, getTbpToRupiahHistory);
// 🔐 Exchanger update Rupiah yang siap dilepas
router.post("/exchanger/rupiah-for-sale", verifyToken, updateRupiahForSale);


router.get("/manual-topup/price/user-exchanger", async (req, res) => {
  try {
    const config = await ManualTopupConfig.findOne({
      where: {
        fromType: "company",
        toType: "user_exchanger",
        priceRupiah: { [Op.ne]: null },
      },
      order: [["updatedAt", "DESC"]],
    });

    if (!config) {
      return res.status(404).json({ error: "Config tidak ditemukan." });
    }

    return res.json({ priceRupiah: config.priceRupiah });
  } catch (err) {
    console.error("❌ Gagal ambil config manual topup:", err);
    res.status(500).json({ error: "Gagal ambil konfigurasi harga SBP." });
  }
});

// routes/userBalanceRoutes.js
router.get("/tbp-exchange-rate", verifyToken, async (req, res) => {
  try {
    const configs = await TbpToRupiahRateConfig.findAll({
      where: {
        type: ["user_to_company", "user_to_exchanger"],
      },
      order: [["updatedAt", "DESC"]],
    });
    return res.json(configs);
  } catch (err) {
    console.error("❌ Gagal ambil exchange rate:", err);
    return res.status(500).json({ error: "Gagal ambil rate TBP." });
  }
});


router.get("/sbp-to-tbp-history", verifyToken, getSbpToTbpHistory);

router.get("/tbp-to-race-history", verifyToken, getTbpToRaceHistory);
router.get("/convert-rupiah-to-sbp/history", verifyToken, getRupiahToSbpHistory);

router.post("/convert-sbp-to-tbp/request", verifyToken, requireKycApproved, requestSbpToTbp);
router.post("/convert-sbp-to-tbp/confirm", verifyToken, requireKycApproved, confirmSbpToTbp);

module.exports = router;

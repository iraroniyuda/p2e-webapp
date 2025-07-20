const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const { Op, fn, col, where } = require("sequelize");
const User = require("../models/User");
const TbpToRupiahRateConfig = require("../models/TbpToRupiahRateConfig");

/**
 * @route GET /user/wallet/:idOrWallet
 * @desc Ambil wallet address user berdasarkan ID numerik atau wallet address Ethereum
 * @access Private
 */
router.get("/wallet/:idOrWallet", verifyToken, async (req, res) => {
  try {
    const { idOrWallet } = req.params;
    const isNumeric = /^\d+$/.test(idOrWallet);

    let user;

    if (isNumeric) {
      // Cari berdasarkan ID numerik
      user = await User.findByPk(parseInt(idOrWallet, 10), {
        attributes: ["id", "username", "wallet"],
      });
    } else {
      // Cari berdasarkan wallet address (case-insensitive)
      user = await User.findOne({
        where: where(fn("LOWER", col("wallet")), idOrWallet.toLowerCase()),
        attributes: ["id", "username", "wallet"],
      });
    }

    if (!user) {
      return res.status(404).json({ error: "User tidak ditemukan." });
    }

    if (!user.wallet) {
      return res.status(400).json({ error: "User belum mengatur wallet address." });
    }

    return res.json({
      userId: user.id,
      username: user.username,
      wallet: user.wallet,
    });
  } catch (err) {
    console.error("❌ Gagal fetch wallet user:", err);
    return res.status(500).json({ error: "Terjadi kesalahan internal." });
  }
});

/**
 * @route GET /user/tbp-exchange-rate
 * @desc Ambil daftar rasio konversi TBP ke Rupiah
 * @access Public
 */
router.get("/tbp-exchange-rate", async (req, res) => {
  try {
    const rates = await TbpToRupiahRateConfig.findAll({
      order: [["updatedAt", "DESC"]],
    });

    return res.json(rates);
  } catch (err) {
    console.error("❌ Gagal ambil TBP-Rupiah rate:", err);
    res.status(500).json({ error: "Gagal ambil data rate." });
  }
});

// routes/userRoutes.js
router.get("/basic-info", verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["exchangerLevel", "isCompanyExchanger", "circuitOwnerLevel"],
    });

    if (!user) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    return res.json({
      exchangerLevel: user.exchangerLevel,
      isCompanyExchanger: user.isCompanyExchanger,
      circuitOwnerLevel: user.circuitOwnerLevel,
    });
  } catch (error) {
    console.error("❌ Gagal ambil basic-info:", error);
    return res.status(500).json({ error: "Gagal ambil data user" });
  }
});




module.exports = router;

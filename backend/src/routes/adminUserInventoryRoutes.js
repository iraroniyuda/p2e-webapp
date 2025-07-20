const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");
const UserInventory = require("../models/UserInventory");
const User = require("../models/User");

router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const data = await UserInventory.findAll({
      include: [{ model: User, as: "user", attributes: ["id", "username", "email"] }],
      order: [["createdAt", "DESC"]],
    });

    res.json(data);
  } catch (err) {
    console.error("❌ Gagal ambil inventory:", err);
    res.status(500).json({ error: "Gagal ambil data" });
  }
});

module.exports = router;

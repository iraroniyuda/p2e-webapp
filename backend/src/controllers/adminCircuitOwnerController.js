const { Op } = require("sequelize");
const User = require("../models/User");

/**
 * Ambil semua user biasa (bukan admin) untuk opsi assign circuit owner
 */
const getUsersForCircuitOwnership = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        role: { [Op.ne]: "admin" }, // ❌ exclude admin
      },
      attributes: ["id", "username", "email"],
      order: [["username", "ASC"]],
    });
    res.json(users);
  } catch (err) {
    console.error("❌ getUsersForCircuitOwnership error:", err);
    res.status(500).json({ error: "Gagal mengambil daftar pengguna." });
  }
};

/**
 * Ambil daftar pengguna yang merupakan Circuit Owner (level ≠ none)
 */
const getCircuitOwners = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        circuitOwnerLevel: { [Op.ne]: "none" },
      },
      attributes: ["id", "username", "email", "circuitOwnerLevel"],
      order: [["username", "ASC"]],
    });
    res.json(users);
  } catch (err) {
    console.error("❌ getCircuitOwners error:", err);
    res.status(500).json({ error: "Gagal mengambil daftar circuit owner." });
  }
};

/**
 * Assign user sebagai Circuit Owner (default level: company)
 */
const assignCircuitOwner = async (req, res) => {
  try {
    const { userId, level = "company" } = req.body;
    if (!userId) return res.status(400).json({ error: "userId wajib diisi" });

    const validLevels = ["company", "silver", "gold", "platinum", "diamond"];
    if (!validLevels.includes(level)) {
      return res.status(400).json({ error: "Level tidak valid." });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User tidak ditemukan" });

    user.circuitOwnerLevel = level;
    await user.save();

    res.json({
      success: true,
      message: `${user.username} sekarang menjadi Circuit Owner level ${level}`,
    });
  } catch (err) {
    console.error("❌ assignCircuitOwner error:", err);
    res.status(500).json({ error: "Gagal assign circuit owner." });
  }
};

/**
 * Unassign Circuit Owner (ubah level ke 'none')
 */
const unassignCircuitOwner = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId wajib diisi" });

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User tidak ditemukan" });

    user.circuitOwnerLevel = "none";
    await user.save();

    res.json({ success: true, message: `${user.username} bukan lagi Circuit Owner` });
  } catch (err) {
    console.error("❌ unassignCircuitOwner error:", err);
    res.status(500).json({ error: "Gagal unassign circuit owner." });
  }
};

module.exports = {
  getUsersForCircuitOwnership,
  getCircuitOwners,
  assignCircuitOwner,
  unassignCircuitOwner,
};

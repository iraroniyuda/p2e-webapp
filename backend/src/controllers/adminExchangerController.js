const { Op } = require("sequelize");
const User = require("../models/User");

/**
 * Ambil semua user yang memiliki exchangerLevel selain "none"
 */
const getExchangerUsers = async (req, res) => {
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
    console.error("❌ getExchangerUsers error:", err);
    res.status(500).json({ error: "Gagal mengambil daftar pengguna." });
  }
};


/**
 * Ambil daftar pengguna yang ditetapkan sebagai Company Exchanger
 */
const getCompanyExchangers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        isCompanyExchanger: true,
      },
      attributes: ["id", "username", "email", "exchangerLevel", "isCompanyExchanger"],
      order: [["username", "ASC"]],
    });
    res.json(users);
  } catch (err) {
    console.error("❌ getCompanyExchangers error:", err);
    res.status(500).json({ error: "Gagal mengambil daftar company exchanger." });
  }
};

/**
 * Assign satu user sebagai Company Exchanger (unassign yang lain)
 */
const assignCompanyExchanger = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId wajib diisi" });

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User tidak ditemukan" });



    // Assign user ini sebagai company exchanger
    user.isCompanyExchanger = true;
    await user.save();

    res.json({ success: true, message: `${user.username} sekarang menjadi Company Exchanger` });
  } catch (err) {
    console.error("❌ assignCompanyExchanger error:", err);
    res.status(500).json({ error: "Gagal assign company exchanger." });
  }
};

module.exports = {
  getExchangerUsers,
  getCompanyExchangers,
  assignCompanyExchanger,
};

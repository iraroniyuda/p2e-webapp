const { Op } = require("sequelize");
const User = require("../models/User");
const UserBalance = require("../models/UserBalance");

exports.getAllUsers = async (req, res) => {
  const { search } = req.query;

  try {
    const users = await User.findAll({
      where: search
        ? {
            [Op.or]: [
              { username: { [Op.iLike]: `%${search}%` } },
              { email: { [Op.iLike]: `%${search}%` } },
            ],
          }
        : undefined,
      attributes: [
        "id", "username", "email", "role", "userLevel", "exchangerLevel",
        "wallet", "isSuspended", "isActive", "isEmailVerified", "createdAt", "referredById"
      ],
      include: [
        {
          model: UserBalance,
          as: "balance",
          attributes: ["sbp", "race", "tbp", "claimedTbp", "rupiah", "sbpForSale", "sbpAvailable"]
        },
        {
          model: User,
          as: "referrer",
          attributes: ["id", "username"], // hanya ambil id dan username referrer
        }
      ],
      order: [["isSuspended", "DESC"], ["createdAt", "DESC"]]
    });

    res.json(users);
  } catch (error) {
    console.error("❌ Gagal mengambil daftar user:", error);
    res.status(500).json({ error: "Gagal mengambil data pengguna" });
  }
};



exports.toggleSuspendUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "User tidak ditemukan" });

    user.isSuspended = !user.isSuspended;
    await user.save();

    res.json({
      success: true,
      isSuspended: user.isSuspended,
      message: `User berhasil ${user.isSuspended ? "disuspend" : "diaktifkan kembali"}`
    });
  } catch (error) {
    console.error("❌ Gagal toggle suspend:", error);
    res.status(500).json({ error: "Gagal update status suspend user" });
  }
};

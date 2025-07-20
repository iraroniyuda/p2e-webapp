const UserBalance = require("../models/UserBalance");

exports.getRaceBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const balance = await UserBalance.findOne({ where: { userId } });

    const race = balance?.race ? balance.race.toString() : "0";

    res.json({ race }); // kirim sebagai string presisi tinggi
  } catch (err) {
    console.error("❌ Gagal ambil saldo RACE:", err);
    res.status(500).json({ error: "Gagal ambil saldo RACE" });
  }
};

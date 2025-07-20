const Decimal = require("decimal.js"); // ⬅️ Tambahkan ini
const UserBalance = require("../models/UserBalance"); // ganti dari RaceBalance
const RaceTransaction = require("../models/RaceTransaction");
const User = require("../models/User");

// GET /admin/race/users
exports.listRaceUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    // 1️⃣ Ambil userId dan race balance saja tanpa JOIN
    const balances = await UserBalance.findAll({
      attributes: ["userId", "race"],
      order: [["updatedAt", "DESC"]],
      limit,
      offset,
    });

    const userIds = balances.map((b) => b.userId);

    // 2️⃣ Ambil data user hanya untuk userId yang muncul di hasil
    const users = await User.findAll({
      where: { id: userIds, deletedAt: null },
      attributes: ["id", "username", "email"],
    });

    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

    // 3️⃣ Gabungkan data
    const result = balances.map((item) => ({
      userId: item.userId,
      balance: item.race?.toString() || "0",
      username: userMap[item.userId]?.username || null,
      email: userMap[item.userId]?.email || null,
    }));

    // 4️⃣ Hitung total rows tanpa JOIN
    const count = await UserBalance.count();

    res.json({
      page,
      limit,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      data: result,
    });
  } catch (err) {
    console.error("❌ Error listRaceUsers:", err);
    res.status(500).json({ error: "Gagal ambil data balance RACE" });
  }
};

// POST /admin/race/transfer
exports.transferRaceToUser = async (req, res) => {
  const { userId, amount, note = "Transfer manual oleh admin" } = req.body;

  try {
    const numericAmount = new Decimal(amount || 0);
    if (numericAmount.lte(0)) {
      return res.status(400).json({ error: "Jumlah transfer tidak valid" });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User tidak ditemukan" });

    const [balance] = await UserBalance.findOrCreate({
      where: { userId },
      defaults: { race: numericAmount.toFixed() },
    });

    const before = new Decimal(balance.race || 0);
    const after = before.plus(numericAmount);

    balance.race = after.toFixed();
    await balance.save();

    await RaceTransaction.create({
      userId,
      type: "admin_adjust",
      amount: numericAmount.toFixed(),
      balanceBefore: before.toFixed(),
      balanceAfter: after.toFixed(),
      reference: "manual_admin",
      note,
    });

    res.json({ message: `✅ ${numericAmount.toFixed()} RACE berhasil ditransfer ke ${user.username}` });
  } catch (err) {
    console.error("❌ Error transferRaceToUser:", err);
    res.status(500).json({ error: "Transfer RACE gagal" });
  }
};

// GET /admin/race/history
exports.getRaceTransactionHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const history = await RaceTransaction.findAll({
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.json(history);
  } catch (err) {
    console.error("❌ Error getRaceTransactionHistory:", err);
    res.status(500).json({ error: "Gagal ambil riwayat RACE" });
  }
};

const SbpTokenHistory = require("../models/SbpTokenHistory");
const UserBalance = require("../models/UserBalance"); 
const User = require("../models/User");
const SbpSourceRule = require("../models/SbpSourceRule");
const grantSbpWithSource = require("../utils/grantSbpWithSource");
const mintAndDistributeSbp = require("../utils/mintAndDistributeSbp");
const SbpAllocationBalance = require("../models/SbpAllocationBalance");
const SbpAllocationConfig = require("../models/SbpAllocationConfig");
const deductFromSbpBalanceDetailPreferAvailable = require("../utils/deductFromSbpBalanceDetailPreferAvailable");
const SbpPool = require("../models/SbpPool");
const { Op } = require("sequelize");
const Decimal = require("decimal.js");


const SbpBurnLog = require("../models/SbpBurnLog");


const SbpAllocationTransferLog = require("../models/SbpAllocationTransferLog");

exports.listSbpUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

const { rows, count } = await User.findAndCountAll({
  where: { deletedAt: null },
  include: [
    {
      model: UserBalance,
      as: "balance", // <-- harus sama seperti di relasi model
      attributes: ["sbp"],
      required: false,
    }
  ],
  attributes: ["id", "username", "email"],
  order: [["id", "ASC"]],
  limit,
  offset
});

const result = rows.map(user => ({
  userId: user.id,
  username: user.username,
  email: user.email,
  // HARUS user.balance, BUKAN user.UserBalance!
  balance: user.balance && user.balance.sbp ? user.balance.sbp.toString() : "0.000000"
}));


    res.json({
      page,
      limit,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      data: result,
    });
  } catch (error) {
    console.error("❌ Error listing SBP users:", error);
    res.status(500).json({ error: "Failed to list SBP balances" });
  }
};


exports.transferAllocationAmount = async (req, res) => {
  try {
    const { fromCategory, toCategory, amount, note } = req.body;

    // Validasi dasar
    if (!fromCategory || !toCategory || !amount) {
      return res.status(400).json({ error: "Semua field wajib diisi." });
    }

    const decimalAmount = new Decimal(amount);
    if (decimalAmount.isNaN() || decimalAmount.lte(0)) {
      return res.status(400).json({ error: "Jumlah harus berupa angka yang valid dan lebih dari 0." });
    }

    // Ambil data alokasi
    const from = await SbpAllocationBalance.findOne({ where: { category: fromCategory } });
    const to = await SbpAllocationBalance.findOne({ where: { category: toCategory } });

    if (!from) {
      return res.status(404).json({ error: "Kategori sumber tidak ditemukan." });
    }

    if (!to) {
      return res.status(404).json({ error: "Kategori tujuan tidak ditemukan." });
    }

    const fromAmount = new Decimal(from.amount || 0);
    if (fromAmount.lt(decimalAmount)) {
      return res.status(400).json({ error: "Saldo tidak mencukupi di kategori sumber." });
    }

    // 🔄 Update saldo kategori sumber dan tujuan
    from.amount = fromAmount.minus(decimalAmount).toString();
    to.amount = new Decimal(to.amount || 0).plus(decimalAmount).toString();

    await from.save();
    await to.save();

    // 📝 Catat log transfer
    await SbpAllocationTransferLog.create({
      fromCategory,
      toCategory,
      amount: decimalAmount.toFixed(18),
      note: note || `Transfer alokasi ${decimalAmount.toFixed(6)} dari ${fromCategory} ke ${toCategory}`,
    });

    res.json({
      message: `✅ Berhasil transfer ${decimalAmount.toFixed(6)} dari ${fromCategory} ke ${toCategory}`,
    });
  } catch (err) {
    console.error("❌ Transfer alokasi gagal:", err);
    res.status(500).json({ error: "Gagal transfer alokasi SBP" });
  }
};



exports.transferSbpToUser = async (req, res) => {
  const { userId, amount, fromCategory = "admin_transfer" } = req.body;

  try {
    const decimalAmount = new Decimal(amount);

    if (decimalAmount.isNaN() || decimalAmount.lte(0)) {
      return res.status(400).json({ error: "Jumlah transfer harus berupa angka valid dan lebih dari 0." });
    }

    // 🔍 Validasi user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    // 🔍 Validasi alokasi sumber
    const sourceBalance = await SbpAllocationBalance.findOne({ where: { category: fromCategory } });
    if (!sourceBalance || new Decimal(sourceBalance.amount || 0).lt(decimalAmount)) {
      return res.status(400).json({ error: `Saldo tidak mencukupi di kategori ${fromCategory}` });
    }

    // 📋 Log alokasi transfer
    await SbpAllocationTransferLog.create({
      fromCategory,
      toCategory: "user",
      amount: decimalAmount.toFixed(18),
      note: `Transfer ${decimalAmount.toFixed(6)} SBP ke ${user.username}`,
    });

    // ➕ Grant ke user (bukan mint)
    await grantSbpWithSource(
      userId,
      decimalAmount.toNumber(), // jika helper masih pakai number (bisa diubah juga ke Decimal)
      fromCategory,
      fromCategory,
      { isMint: false }
    );

    res.json({
      message: `✅ ${decimalAmount.toFixed(6)} S-BP berhasil ditransfer ke ${user.username}`,
    });
  } catch (error) {
    console.error("❌ Gagal transfer S-BP ke user:", error);
    res.status(500).json({ error: "Transfer gagal" });
  }
};





exports.deductSbpFromUser = async (req, res) => {
  const { userId, amount, toCategory = "admin_deduction", note } = req.body;

  try {
    const decimalAmount = new Decimal(amount);
    if (decimalAmount.isNaN() || decimalAmount.lte(0)) {
      return res.status(400).json({ error: "Jumlah pengurangan harus lebih dari 0 dan valid." });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User tidak ditemukan" });

    const userBalance = await UserBalance.findOne({ where: { userId } });
    if (!userBalance || userBalance.sbp.lt(decimalAmount)) {
      return res.status(400).json({ error: "Saldo SBP user tidak mencukupi" });
    }

    // 🔄 Kurangi dari detail balance (prioritas available > forSale)
    await deductFromSbpBalanceDetailPreferAvailable(userId, decimalAmount.toNumber());

    // 🔺 Tambahkan ke kategori alokasi tujuan
    const targetAllocation = await SbpAllocationBalance.findOne({ where: { category: toCategory } });
    if (!targetAllocation) {
      return res.status(404).json({ error: "Kategori tujuan tidak ditemukan." });
    }

    targetAllocation.amount = new Decimal(targetAllocation.amount || 0)
      .plus(decimalAmount)
      .toString();
    await targetAllocation.save();

    // 📝 Log transfer alokasi
    await SbpAllocationTransferLog.create({
      fromCategory: "user",
      toCategory,
      amount: decimalAmount.toFixed(18),
      note: note || `Pengurangan ${decimalAmount.toFixed(6)} SBP dari user ${user.username}`,
    });

    // 🔄 Update pool (rollback dari totalTransferred)
    const [pool] = await SbpPool.findOrCreate({
      where: { id: 1 },
      defaults: { totalMinted: 0, totalBurned: 0, totalTransferred: 0 },
    });

    const currentTransferred = new Decimal(pool.totalTransferred || 0);
    let updatedTransferred = currentTransferred.minus(decimalAmount);
    if (updatedTransferred.lt(0)) updatedTransferred = new Decimal(0);
    pool.totalTransferred = updatedTransferred.toString();
    await pool.save();

    const totalSupply = new Decimal(pool.totalMinted || 0).minus(pool.totalBurned || 0);

    // 📋 Catat histori
    await SbpTokenHistory.create({
      type: "deduct",
      minted: 0,
      burned: 0,
      transferred: decimalAmount.negated().toFixed(18),
      totalSupply: totalSupply.toFixed(18),
      note: note || `Pengurangan SBP dari ${user.username} ke ${toCategory}`,
    });

    res.json({
      message: `✅ Berhasil mengurangi ${decimalAmount.toFixed(6)} SBP dari ${user.username}`,
    });
  } catch (error) {
    console.error("❌ Gagal mengurangi SBP dari user:", error);
    res.status(500).json({ error: "Pengurangan SBP gagal" });
  }
};


// Total SBP yang sudah diberikan dari mining
exports.getTotalSbpMined = async (req, res) => {
  try {
    const total = await SbpTokenHistory.sum("mined", {
      where: { type: "mining" }, // cukup ini
    });

    res.json({ totalMined: total || 0 });
  } catch (err) {
    console.error("❌ getTotalSbpMined error:", err);
    res.status(500).json({ error: "Gagal ambil total mining SBP" });
  }
};



// GET /admin/sbp/all-users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        deletedAt: null
      },
      attributes: ["id", "username", "email"],
      order: [["username", "ASC"]],
      limit: 100, // 🔒 tambahkan batasan aman!
    });

    res.json(users);
  } catch (error) {
    console.error("❌ Error fetching all users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};


exports.getSbpSettings = async (req, res) => {
  try {
    const [
      totalMinted,
      totalBurned,
      totalTransferred,
      totalDeducted,
      totalMined,
      totalAirdropped,
      totalStaked,
      totalSale,
      totalBonus,
    ] = await Promise.all([
      SbpTokenHistory.sum("minted", { where: { type: "mint" } }),
      SbpTokenHistory.sum("burned", { where: { type: "burn" } }),
      SbpTokenHistory.sum("transferred", { where: { type: "transfer" } }),
      SbpTokenHistory.sum("transferred", { where: { type: "deduct" } }),
      SbpTokenHistory.sum("mined", { where: { type: "mining" } }),
      SbpTokenHistory.sum("airdropped", { where: { type: "airdrop" } }),
      SbpTokenHistory.sum("staked", { where: { type: "staking" } }),
      SbpTokenHistory.sum("sale", { where: { type: "sale" } }),
      SbpTokenHistory.sum("bonus", { where: { type: "bonus" } }),
    ]);

    // Gunakan Decimal.js untuk semua kalkulasi
    const minted = new Decimal(totalMinted || 0);
    const burned = new Decimal(totalBurned || 0);
    const transferred = new Decimal(totalTransferred || 0);
    const deducted = new Decimal(totalDeducted || 0);
    const mined = new Decimal(totalMined || 0);
    const airdropped = new Decimal(totalAirdropped || 0);
    const staked = new Decimal(totalStaked || 0);
    const sale = new Decimal(totalSale || 0);
    const bonus = new Decimal(totalBonus || 0);

    const totalSupply = minted.minus(burned);
    const ownedSupply = totalSupply
      .minus(transferred)
      .minus(deducted)
      .minus(sale)
      .minus(bonus)
      .minus(airdropped)
      .minus(staked)
      .minus(mined);

    return res.json({
      totalSupply: totalSupply.toFixed(18),
      ownedSupply: ownedSupply.toFixed(18),
      totalMinted: minted.toFixed(18),
      totalBurned: burned.toFixed(18),
      totalTransferred: transferred.toFixed(18),
      totalDeducted: deducted.toFixed(18),
      totalMined: mined.toFixed(18),
      totalAirdropped: airdropped.toFixed(18),
      totalStaked: staked.toFixed(18),
      totalSale: sale.toFixed(18),
      totalBonus: bonus.toFixed(18),
    });
  } catch (err) {
    console.error("❌ Gagal ambil settings SBP:", err);
    return res.status(500).json({ error: "Gagal ambil settings SBP" });
  }
};



exports.updateSbpPrice = async (req, res) => {
  try {
    const { priceBuy, priceSell, priceTbpInIdr, note } = req.body;

    if (!priceBuy || !priceSell || !priceTbpInIdr) {
      return res.status(400).json({ error: "Semua nilai wajib diisi" });
    }

    const latest = await SbpTokenHistory.findOne({ order: [["createdAt", "DESC"]] });
    const totalSupply = latest?.totalSupply || 0;

    const conversionRateToTbp = priceBuy / priceTbpInIdr;

    const record = await SbpTokenHistory.create({
      type: "price-update",
      priceBuy,
      priceSell,
      priceTbpInIdr,
      conversionRateToTbp,
      totalSupply,
      note,
    });

    res.json({ message: "Harga SBP berhasil diperbarui", record });
  } catch (error) {
    console.error("❌ Gagal update harga SBP:", error);
    res.status(500).json({ error: "Gagal update harga SBP" });
  }
};


exports.mintSbp = async (req, res) => {
  try {
    const { amount } = req.body;
    const decimalAmount = new Decimal(amount);

    if (decimalAmount.isNaN() || decimalAmount.lte(0)) {
      return res.status(400).json({ error: "Jumlah mint tidak valid" });
    }

    // ✅ Proses mint dan distribusi (sekali saja)
    const result = await mintAndDistributeSbp(
      decimalAmount.toNumber(), // jika helper belum support Decimal penuh
      `Mint ${decimalAmount.toFixed(6)} SBP oleh admin`
    );

    res.json({ message: result.message });
  } catch (error) {
    console.error("❌ Minting failed:", error);
    res.status(500).json({ error: "Gagal mint S-BP" });
  }
};

exports.burnSbp = async (req, res) => {
  try {
    const { amount, category, note } = req.body;
    const decimalAmount = new Decimal(amount);

    if (decimalAmount.isNaN() || decimalAmount.lte(0) || !category) {
      return res.status(400).json({ error: "Jumlah dan kategori burn wajib diisi." });
    }

    // 🔍 Validasi alokasi kategori
    const allocation = await SbpAllocationBalance.findOne({ where: { category } });
    if (!allocation || new Decimal(allocation.amount || 0).lt(decimalAmount)) {
      return res.status(400).json({ error: "Saldo kategori tidak mencukupi untuk dibakar." });
    }

    // 🔻 Kurangi dari alokasi kategori
    allocation.amount = new Decimal(allocation.amount).minus(decimalAmount).toString();
    await allocation.save();

    // 📝 Simpan log burn spesifik
    await SbpBurnLog.create({
      category,
      amount: decimalAmount.toFixed(18),
      note: note || `Burn ${decimalAmount.toFixed(6)} SBP dari kategori ${category}`,
    });

    // 🔄 Update pool totalBurned
    const [pool] = await SbpPool.findOrCreate({
      where: { id: 1 },
      defaults: { totalMinted: 0, totalBurned: 0 },
    });

    const updatedBurned = new Decimal(pool.totalBurned || 0).plus(decimalAmount);
    pool.totalBurned = updatedBurned.toString();
    await pool.save();

    // 📦 Hitung totalSupply aktual dari pool
    const totalSupply = new Decimal(pool.totalMinted || 0).minus(pool.totalBurned || 0);

    // 📋 Catat histori burn
    await SbpTokenHistory.create({
      type: "burn",
      minted: 0,
      burned: decimalAmount.toFixed(18),
      transferred: 0,
      totalSupply: totalSupply.toFixed(18),
      note: note || `Burn ${decimalAmount.toFixed(6)} SBP dari kategori ${category}`,
    });

    res.json({
      message: `✅ Berhasil burn ${decimalAmount.toFixed(6)} SBP dari kategori ${category}`,
    });
  } catch (error) {
    console.error("❌ Burn failed:", error);
    res.status(500).json({ error: "Gagal burn S-BP" });
  }
};


// GET /admin/sbp/history
exports.getSbpHistory = async (req, res) => {
  try {
    const history = await SbpTokenHistory.findAll({
      order: [["createdAt", "DESC"]],
      attributes: [
        "createdAt",
        "type",
        "note",
        "minted",
        "burned",
        "transferred",
        "mined",
        "airdropped",
        "staked",
        "sale",
        "bonus",           // ✅ tambahkan ini
        "totalSupply"
      ],
    });
    res.json(history);
  } catch (error) {
    console.error("❌ Gagal mengambil riwayat SBP:", error);
    res.status(500).json({ error: "Gagal mengambil riwayat SBP" });
  }
};





// 🔹 GET /admin/sbp-source-rules
exports.getAllSourceRules = async (req, res) => {
  try {
    const rules = await SbpSourceRule.findAll({ order: [["source", "ASC"]] });
    res.json(rules);
  } catch (err) {
    console.error("❌ Gagal ambil SbpSourceRule:", err);
    res.status(500).json({ error: "Gagal ambil rules" });
  }
};

// 🔹 POST /admin/sbp-source-rules
exports.createSourceRule = async (req, res) => {
  try {
    const { source, locked, durationDays } = req.body;
    const rule = await SbpSourceRule.create({ source, locked, durationDays });
    res.json(rule);
  } catch (err) {
    console.error("❌ Gagal buat SbpSourceRule:", err);
    res.status(500).json({ error: "Gagal tambah rule" });
  }
};

// 🔹 PUT /admin/sbp-source-rules/:id
exports.updateSourceRule = async (req, res) => {
  try {
    const { id } = req.params;
    const { locked, durationDays } = req.body;

    const rule = await SbpSourceRule.findByPk(id);
    if (!rule) return res.status(404).json({ error: "Rule tidak ditemukan" });

    rule.locked = locked;
    rule.durationDays = durationDays;
    await rule.save();

    res.json(rule);
  } catch (err) {
    console.error("❌ Gagal update SbpSourceRule:", err);
    res.status(500).json({ error: "Gagal update rule" });
  }
};

// 🔹 DELETE /admin/sbp-source-rules/:id
exports.deleteSourceRule = async (req, res) => {
  try {
    const { id } = req.params;
    await SbpSourceRule.destroy({ where: { id } });
    res.json({ message: "Rule dihapus" });
  } catch (err) {
    console.error("❌ Gagal hapus SbpSourceRule:", err);
    res.status(500).json({ error: "Gagal hapus rule" });
  }
};



exports.getAllocationSummary = async (req, res) => {
  try {
    const balances = await SbpAllocationBalance.findAll();

    // Hitung total dengan Decimal
    const total = balances.reduce((acc, b) => {
      const val = new Decimal(b.amount || 0);
      return acc.plus(val);
    }, new Decimal(0));

    const summary = balances.map((bal) => {
      const amount = new Decimal(bal.amount || 0);
      const percent = total.gt(0)
        ? amount.div(total).times(100).toFixed(2) // Presisi 2 angka di belakang koma
        : "0.00";

      return {
        category: bal.category,
        amount: amount.toFixed(18), // Jika ingin presisi penuh
        percent,                    // dalam string persen, contoh "12.34"
      };
    });

    res.json(summary);
  } catch (err) {
    console.error("❌ Gagal ambil ringkasan alokasi:", err);
    res.status(500).json({ error: "Gagal ambil data alokasi" });
  }
};


// GET /admin/sbp/allocation-categories
exports.getAllocationCategories = async (req, res) => {
  try {
    const configs = await SbpAllocationConfig.findAll({
      attributes: ["category"],
      order: [["id", "ASC"]],
    });

    const categories = configs.map(c => c.category);
    res.json(categories);
  } catch (err) {
    console.error("❌ Gagal ambil kategori burn:", err);
    res.status(500).json({ error: "Gagal ambil kategori" });
  }
};

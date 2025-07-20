const Decimal = require("decimal.js");
const SbpTokenHistory = require("../models/SbpTokenHistory");
const SbpPool = require("../models/SbpPool");
const SbpAllocationBalance = require("../models/SbpAllocationBalance");
const SbpAllocationConfig = require("../models/SbpAllocationConfig");
const SbpAllocationTransferLog = require("../models/SbpAllocationTransferLog");

module.exports = async function mintAndDistributeSbp(amount, note = "Mint SBP") {
  if (!amount || isNaN(amount) || amount <= 0) {
    throw new Error("Jumlah mint tidak valid");
  }

  const parsedAmount = new Decimal(amount);

  // 🔍 Ambil histori dan konfigurasi alokasi
  const latest = await SbpTokenHistory.findOne({ order: [["createdAt", "DESC"]] });
  const configs = await SbpAllocationConfig.findAll({ order: [["id", "ASC"]] });

  const currentSupply = new Decimal(latest?.totalSupply || 0);
  const totalSupply = currentSupply.plus(parsedAmount);

  // 🧾 Catat histori mint
  await SbpTokenHistory.create({
    type: "mint",
    minted: parsedAmount.toFixed(),
    burned: "0",
    transferred: "0",
    totalSupply: totalSupply.toFixed(),
    note,
  });

  // 💾 Update total pool
  const [pool] = await SbpPool.findOrCreate({
    where: { id: 1 },
    defaults: {
      totalMinted: "0",
      totalBurned: "0",
      totalTransferred: "0",
      totalMined: "0",
      airdropped: "0",
      bonus: "0",
      sale: "0",
    },
  });

  pool.totalMinted = new Decimal(pool.totalMinted || 0).plus(parsedAmount).toFixed();
  await pool.save();

  // 📊 Distribusi ke alokasi kategori
  let totalAllocated = new Decimal(0);
  const allocations = [];

  for (let i = 0; i < configs.length; i++) {
    const cfg = configs[i];
    let allocation;

    if (i === configs.length - 1) {
      // Terakhir → sisa
      allocation = parsedAmount.minus(totalAllocated);
    } else {
      allocation = parsedAmount.mul(cfg.percent).div(100).floor();
      totalAllocated = totalAllocated.plus(allocation);
    }

    allocations.push({ category: cfg.category, amount: allocation });
  }

  // 🧾 Simpan alokasi & log
  for (const { category, amount } of allocations) {
    const [bal] = await SbpAllocationBalance.findOrCreate({ where: { category } });
    bal.amount = new Decimal(bal.amount || 0).plus(amount).toFixed();
    await bal.save();

    await SbpAllocationTransferLog.create({
      fromCategory: "mint",
      toCategory: category,
      amount: amount.toFixed(),
      note: `Distribusi dari mint ${parsedAmount.toFixed()} SBP ke kategori ${category}`,
    });
  }

  return { message: `✅ Mint & alokasi ${parsedAmount.toFixed()} SBP selesai` };
};

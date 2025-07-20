const Decimal = require("decimal.js");
const User = require("../models/User");
const UserBalance = require("../models/UserBalance");
const SbpSaleHistory = require("../models/SbpSaleHistory");
const SbpBalanceDetail = require("../models/SbpBalanceDetail");
const SbpAllocationBalance = require("../models/SbpAllocationBalance");
const SbpPool = require("../models/SbpPool");
const autoUpgradeUserLevel = require("./autoUpgradeUserLevel")
const addBalance = require("./addBalance");
const recordSbpHistory = require("./recordSbpHistory");
const applyReferralBonus = require("./applyReferralBonus");
const getExchangerRule = require("./getExchangerRule");
const grantSbpWithSource = require("./grantSbpWithSource");
const deductFromSbpBalanceDetailPreferAvailable = require("./deductFromSbpBalanceDetailPreferAvailable");

module.exports = async function manualTopupProcessor(tx, user, rule, exchangerParam = null) {
  console.log("🔧 Proses manualTopup - tx ID:", tx.id, "exchangerId:", tx.exchangerId);

  if (!tx.exchangerId) {
    throw new Error(`❌ Transaksi ${tx.id} wajib melalui exchanger.`);
  }

  const amountRupiah = new Decimal(tx.amount || 0);
  const unitPrice = new Decimal(rule.priceRupiah || 0);
  const unitSbp = new Decimal(rule.obtainedSBP || 0);

  if (unitPrice.lte(0) || unitSbp.lte(0) || amountRupiah.lte(0)) {
    throw new Error(`❌ Nilai rule atau amount tidak valid untuk tx ${tx.id}`);
  }

  const totalSbp = amountRupiah.div(unitPrice).mul(unitSbp).floor();
  if (totalSbp.lte(0)) {
    throw new Error(`❌ totalSbp tidak valid untuk tx ${tx.id}`);
  }

  // 🔍 Ambil exchanger jika belum dikirim
  let exchanger = exchangerParam;
  if (!exchanger || !exchanger.id) {
    exchanger = await User.findOne({
      where: { id: tx.exchangerId },
      attributes: ["id", "username", "isCompanyExchanger", "exchangerLevel"],
      paranoid: false,
    });
    if (!exchanger) throw new Error(`❌ Exchanger ID ${tx.exchangerId} tidak ditemukan`);
  }

  const isUserExchanger = ["mid", "senior", "executive"].includes(exchanger.exchangerLevel);

  // 🔻 Kurangi SBP dari penjual
  const balance = await UserBalance.findOne({ where: { userId: exchanger.id } });
  if (!balance) throw new Error(`❌ Balance exchanger ${exchanger.username} tidak ditemukan`);

  await deductFromSbpBalanceDetailPreferAvailable(
    exchanger.id,
    totalSbp.toFixed(),
    `sold_to_user_${user.id}`,
    undefined,                
    isUserExchanger ? false : true 
  );

  

  await SbpBalanceDetail.create({
    userId: exchanger.id,
    source: `sold_to_user_${user.id}`,
    amount: totalSbp.negated().toFixed(), // nilai negatif
  });


  // ➕ Tambahkan SBP ke user
  await addBalance(user.id, "SBP", totalSbp.toFixed());
  await SbpBalanceDetail.create({
    userId: user.id,
    source: `from_user_${exchanger.id}`,
    amount: totalSbp.toFixed(),
  });

  await recordSbpHistory({
    type: "sale",
    amount: totalSbp.toFixed(),
    user,
    note: `Pembelian SBP dari ${exchanger.username}`,
  });

  // 💰 Transfer uang ke exchanger
  await addBalance(exchanger.id, "IDR", amountRupiah);
  console.log(`💰 ${exchanger.username} menerima Rp${amountRupiah} dari user ${user.username}`);

  // 🎁 Komisi khusus user exchanger
  let bonusPercent = 0;
  if (isUserExchanger) {
    const config = await getExchangerRule(exchanger.exchangerLevel);
    const bonusAsset = config.bonusAsset;
    bonusPercent = parseFloat(config.bonusPercent || 0);

    if (bonusAsset === "SBP" && bonusPercent > 0) {
      const bonusAmount = totalSbp.mul(bonusPercent).div(100).floor();

      if (bonusAmount.gt(0)) {
        console.log(`🎁 Bonus ${bonusAmount.toFixed()} SBP → ${exchanger.username} (${bonusPercent}%)`);

        // Validasi dan kurangi dari pool ExchangerBonus
        const allocation = await SbpAllocationBalance.findOne({ where: { category: "StakingAndReward" } });
        if (!allocation || new Decimal(allocation.amount).lt(bonusAmount)) {
          throw new Error("❌ Saldo ExchangerBonus pool tidak cukup untuk bonus");
        }

        await allocation.decrement("amount", { by: bonusAmount.toFixed() });
        const pool = await SbpPool.findOne(); // atau with { where: { id: 1 } } if applicable
        if (!pool) throw new Error("❌ SbpPool tidak ditemukan");
        await pool.increment("bonus", { by: bonusAmount.toFixed() });


        // Tambahkan ke exchanger
        await grantSbpWithSource(
          exchanger.id,
          bonusAmount.toFixed(),
          "exchanger_commision",
          "ExchangerBonus",
          { note: `Bonus ${bonusPercent}% dari user ${user.username}` }
        );

        await recordSbpHistory({
          type: "bonus",
          amount: bonusAmount.toFixed(),
          user: exchanger,
          note: `Bonus ${bonusPercent}% dari transaksi ${user.username}`,
        });
      }
    }
  }

  // 📜 Catat histori penjualan
  await SbpSaleHistory.create({
    fromUserId: exchanger.id,
    toUserId: user.id,
    sbpAmount: totalSbp.toFixed(),
    priceRupiah: amountRupiah.toNumber(),
    feePercent: 0,
    bonusPercent,
    finalAmountToExchanger: amountRupiah.toNumber(),
    note: `Top-up manual oleh ${user.username}`,
  });

  // 🧠 Bonus referral (jika ada)
  await applyReferralBonus(user, "manual_topup", {
    transactionAmount: amountRupiah.toNumber(),
    valueSBP: totalSbp.toFixed(),
  });

  await autoUpgradeUserLevel(user);
};

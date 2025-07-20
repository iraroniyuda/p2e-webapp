const grantSbpWithSource = require("./grantSbpWithSource");
const recordSbpHistory = require("./recordSbpHistory");
const applyPackageToBalance = require("./applyPackageToBalance");
const UserActivationProgress = require("../models/UserActivationProgress");
const SbpToTbpConversionRate = require("../models/SbpToTbpConversionRate");
const Decimal = require("decimal.js");

module.exports = async function packageTopupProcessor(tx, user, pkg) {
  const sbpValue = new Decimal(pkg.valueSBP || 0);
  const transactionType = `buy_package_${pkg.id}`;

  // ✅ Grant SBP jika ada
  if (sbpValue.gt(0)) {
    await grantSbpWithSource(user.id, sbpValue.toFixed(), transactionType, "PublicSale");
  }

  // 📄 Catat history meskipun 0 SBP
  await recordSbpHistory({
    type: "sale",
    amount: sbpValue.toFixed(),
    user,
    note: `Beli Paket oleh ${user.username}`,
  });

  // ✅ Tambahkan RACE & TBP ke balance
  await applyPackageToBalance(user.id, tx.description);

  // ⛔ Jika bukan paket aktivasi (tidak punya levelName), lewati
  if (!pkg.levelName) {
    console.warn(`❌ Paket "${pkg.title}" tidak punya levelName. Lewati aktivasi akun.`);
    return;
  }

  // 🔢 Ambil rasio konversi SBP → TBP
  const latestRate = await SbpToTbpConversionRate.findOne({
    order: [["createdAt", "DESC"]],
  });

  const sbpRate = new Decimal(latestRate?.sbpAmount || 1);
  const tbpRate = new Decimal(latestRate?.tbpAmount || 0);

  // 🧠 Kalkulasi TBP yang dibutuhkan
  const expectedTBP = sbpValue.mul(tbpRate).div(sbpRate).toFixed();

  // 📝 Simpan progress aktivasi
  await UserActivationProgress.upsert({
    userId: user.id,
    requiredSBP: sbpValue.toFixed(),
    requiredTBP: expectedTBP,
    sbpToTbpDone: 0,
    tbpToRaceDone: 0,
    isActivated: false,
    isReady: false,
    userLevelToGrant: pkg.levelName,
    packageName: pkg.title,
    packageId: pkg.id,
  });
};

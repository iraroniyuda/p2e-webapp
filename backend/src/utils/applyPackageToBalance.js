const Decimal = require("decimal.js");
const UserBalance = require("../models/UserBalance");
const TopupPackage = require("../models/TopupPackage");

/**
 * Apply top-up impact ke UserBalance (baik Paket atau Manual)
 * @param {number} userId - ID pengguna
 * @param {string} description - Deskripsi dari UserTransaction
 */
const applyPackageToBalance = async (userId, description) => {
  if (!description || !userId) {
    console.warn("⚠️ applyPackageToBalance: Missing description or userId.");
    return;
  }

  const [balance] = await UserBalance.findOrCreate({
    where: { userId },
    defaults: { sbp: "0", race: "0", tbp: "0", rupiah: "0" },
  });

  // 🎁 Paket Top-up → hanya proses RACE/TBP
  if (description.startsWith("Beli Paket:")) {
    const match = description.match(/Beli Paket:\s*(.+)/i);
    const title = match?.[1]?.trim();
    if (!title) return;

    const pkg = await TopupPackage.findOne({ where: { title } });
    if (!pkg) return;

    // ✅ RACE & TBP saja (pakai Decimal)
    const currentRace = new Decimal(balance.race || 0);
    const currentTbp = new Decimal(balance.tbp || 0);
    const raceToAdd = new Decimal(pkg.obtainedRACE || 0);
    const tbpToAdd = new Decimal(pkg.obtainedTBP || 0);

    balance.race = currentRace.plus(raceToAdd).toFixed();
    balance.tbp = currentTbp.plus(tbpToAdd).toFixed();

    await balance.save();
    return;
  }

  // 💰 Manual top-up → TIDAK grant SBP di sini
  if (description.startsWith("Top-Up Manual:")) {
    return;
  }

  // 🛑 Tidak dikenali
  console.warn(`⚠️ applyPackageToBalance: Deskripsi tidak dikenali: "${description}"`);
};

module.exports = applyPackageToBalance;

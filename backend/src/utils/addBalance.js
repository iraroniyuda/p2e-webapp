const Decimal = require("decimal.js");
const UserBalance = require("../models/UserBalance");

/**
 * Tambah saldo ke user untuk jenis aset tertentu (presisi tinggi)
 * 
 * @param {number} userId - ID user penerima saldo
 * @param {"SBP"|"RACE"|"TBP"|"IDR"} asset - Jenis aset
 * @param {number|string} value - Nilai yang ingin ditambahkan
 */
const addBalance = async (userId, asset, value) => {
  if (!userId || !asset || isNaN(value) || new Decimal(value).lte(0)) {
    throw new Error("❌ Parameter tidak valid untuk addBalance");
  }

  const assetMap = {
    SBP: "sbp",
    RACE: "race",
    TBP: "tbp",
    IDR: "rupiah",
  };

  const column = assetMap[asset];
  if (!column) {
    throw new Error(`❌ Aset '${asset}' tidak dikenali dalam addBalance`);
  }

  const [balance] = await UserBalance.findOrCreate({ where: { userId } });

  const current = new Decimal(balance[column] || 0);
  const next = current.plus(value);
  balance[column] = next.toFixed(); // simpan sebagai string presisi tinggi

  await balance.save();

  console.log(`✅ addBalance: +${new Decimal(value).toFixed()} ${asset} ke user ${userId}`);
};

module.exports = addBalance;

const { Op } = require("sequelize");
const Decimal = require("decimal.js");
const SbpBalanceDetail = require("../models/SbpBalanceDetail");
const UserBalance = require("../models/UserBalance");

/**
 * Mengurangi SBP user secara detail (FIFO, source-aware).
 * - onlyFromForSale: true  => Hanya ambil dari source PublicSale (company exchanger)
 * - onlyFromForSale: false => Potong semua sumber amount positif (user exchanger)
 *
 * @param {number} userId
 * @param {string|number|Decimal} amount - Jumlah SBP yang akan dikurangi
 * @param {string} sourceNote - Catatan sumber pengurangan (bisa null/ignore)
 * @param {object} [transaction] - Sequelize transaction
 * @param {boolean} [onlyFromForSale] - True: hanya sumber jual, False: semua sumber
 */
const deductFromSbpBalanceDetailPreferAvailable = async (
  userId,
  amount,
  sourceNote = "",
  transaction = undefined,
  onlyFromForSale = false
) => {
  const remaining = new Decimal(amount || 0);
  if (!userId || remaining.lte(0)) {
    throw new Error("Parameter tidak valid");
  }

  const now = new Date();

  // Lock balance row jika pakai transaction
  const balance = await UserBalance.findOne({
    where: { userId },
    ...(transaction && { transaction, lock: transaction.LOCK.UPDATE })
  });

  if (!balance || new Decimal(balance.sbp || 0).lt(remaining)) {
    throw new Error("Saldo SBP tidak mencukupi");
  }

  // Cari detail yang masih "live"
  let details;
  if (onlyFromForSale) {
    // Mode company: hanya PublicSale, bisa tambah crowdsale dll kalau mau
    details = await SbpBalanceDetail.findAll({
      where: {
        userId,
        source: { [Op.in]: ["PublicSale"] },
        [Op.or]: [{ lockedUntil: null }, { lockedUntil: { [Op.lte]: now } }],
      },
      order: [["createdAt", "ASC"]],
      ...(transaction && { transaction, lock: transaction.LOCK.UPDATE })
    });
  } else {
    // Mode user exchanger: semua sumber positif (tidak perlu filter source)
    details = await SbpBalanceDetail.findAll({
      where: {
        userId,
        [Op.or]: [{ lockedUntil: null }, { lockedUntil: { [Op.lte]: now } }],
      },
      order: [["createdAt", "ASC"]],
      ...(transaction && { transaction, lock: transaction.LOCK.UPDATE })
    });
  }

  let remainingToDeduct = remaining;
  let availableUsed = new Decimal(0);
  let forSaleUsed = new Decimal(0);

  for (const detail of details) {
    if (remainingToDeduct.lte(0)) break;

    const amt = new Decimal(detail.amount || 0);
    if (amt.lte(0)) continue;

    let totalUsed;

    if (!onlyFromForSale) {
      // === PATCH PALING SIMPLE UNTUK USER EXCHANGER ===
      totalUsed = Decimal.min(amt, remainingToDeduct);
    } else {
      // === MODE COMPANY EXCHANGER, LOGIC LAMA ===
      let useFromAvailable = Decimal.min(amt, balance.sbp.minus(balance.sbpForSale).minus(availableUsed), remainingToDeduct);
      useFromAvailable = useFromAvailable.gte(0) ? useFromAvailable : new Decimal(0);

      let useFromForSale = new Decimal(0);
      if (useFromAvailable.lt(remainingToDeduct)) {
        const maxFromForSale = Decimal.min(
          amt.minus(useFromAvailable),
          new Decimal(balance.sbpForSale || 0).minus(forSaleUsed),
          remainingToDeduct.minus(useFromAvailable)
        );
        useFromForSale = maxFromForSale.gte(0) ? maxFromForSale : new Decimal(0);
      }
      totalUsed = useFromAvailable.plus(useFromForSale);

      availableUsed = availableUsed.plus(useFromAvailable);
      forSaleUsed = forSaleUsed.plus(useFromForSale);
    }

    if (totalUsed.lte(0)) continue;

    remainingToDeduct = remainingToDeduct.minus(totalUsed);

    if (totalUsed.eq(amt)) {
      await detail.destroy({ transaction });
    } else {
      detail.amount = amt.minus(totalUsed).toFixed();
      await detail.save({ transaction });
    }
  }

  if (remainingToDeduct.gt(0)) {
    throw new Error("Terjadi kesalahan: pengurangan tidak selesai tuntas");
  }

  // Update final balance user
  await balance.decrement("sbp", { by: remaining.toFixed(), transaction });

  // Update sbpForSale jika forSaleUsed > 0 (company mode)
  if (onlyFromForSale && forSaleUsed.gt(0)) {
    const newForSale = Decimal.max(new Decimal(balance.sbpForSale || 0).minus(forSaleUsed), 0);
    balance.sbpForSale = newForSale.toFixed();
    await balance.save({ transaction });
  }
};

module.exports = deductFromSbpBalanceDetailPreferAvailable;

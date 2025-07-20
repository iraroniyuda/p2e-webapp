const { Op } = require("sequelize");
const sequelize = require("../config/database");
const Decimal = require("decimal.js");

const AirdropSchedule = require("../models/AirdropSchedule");
const AirdropParticipant = require("../models/AirdropParticipant");
const SbpSourceRule = require("../models/SbpSourceRule");
const SbpBalanceDetail = require("../models/SbpBalanceDetail");
const UserBalance = require("../models/UserBalance");
const SbpAllocationBalance = require("../models/SbpAllocationBalance");
const SbpTokenHistory = require("../models/SbpTokenHistory");
const SbpPool = require("../models/SbpPool");

module.exports = async function distributeAirdrop(scheduleId) {
  const transaction = await sequelize.transaction();

  try {
    const schedule = await AirdropSchedule.findByPk(scheduleId, { transaction });
    if (!schedule) throw new Error("Airdrop schedule not found");
    if (schedule.isClosed) throw new Error("Airdrop already closed");

    const participants = await AirdropParticipant.findAll({
      where: { scheduleId, status: "APPROVED" },
      transaction,
    });

    const sbpRule = await SbpSourceRule.findOne({
      where: { source: schedule.source },
      transaction,
    });

    const allocationCategory = "Airdrop";
    const allocation = await SbpAllocationBalance.findOne({
      where: { category: { [Op.iLike]: allocationCategory } },
      transaction,
    });

    const amountPerUser = new Decimal(schedule.amountPerUser);
    const totalDistributed = amountPerUser.mul(participants.length);

    if (!allocation) {
      throw new Error(`❌ Alokasi kategori '${allocationCategory}' tidak ditemukan`);
    }
    if (new Decimal(allocation.amount).lt(totalDistributed)) {
      throw new Error(`❌ Alokasi SBP kategori '${allocationCategory}' tidak mencukupi (tersedia ${allocation.amount}, butuh ${totalDistributed.toString()})`);
    }

    const now = new Date();

    for (const p of participants) {
      let lockedUntil = null;

      if (sbpRule?.locked && sbpRule.durationDays > 0) {
        lockedUntil = new Date(now.getTime() + sbpRule.durationDays * 86400000);
      }

      await SbpBalanceDetail.create({
        userId: p.userId,
        source: schedule.source,
        amount: amountPerUser.toString(),
        lockedUntil,
      }, { transaction });

      const [balance] = await UserBalance.findOrCreate({
        where: { userId: p.userId },
        transaction,
      });

      balance.sbp = balance.sbp.plus(amountPerUser);
      if (!lockedUntil) {
        balance.sbpAvailable = balance.sbpAvailable.plus(amountPerUser);
      }

      await balance.save({ transaction });
    }

    allocation.amount = new Decimal(allocation.amount).minus(totalDistributed).toString();
    await allocation.save({ transaction });

    await schedule.update({ isClosed: true }, { transaction });

    const [pool] = await SbpPool.findOrCreate({
      where: { id: 1 },
      defaults: {
        totalMinted: 0,
        totalBurned: 0,
        totalTransferred: 0,
        totalMined: 0,
        airdropped: 0,
      },
      transaction,
    });

    pool.airdropped = new Decimal(pool.airdropped).plus(totalDistributed).toString();
    pool.totalTransferred = new Decimal(pool.totalTransferred).plus(totalDistributed).toString();

    await pool.save({ transaction });

    await SbpTokenHistory.create({
      type: "airdrop",
      minted: 0,
      burned: 0,
      transferred: 0,
      mined: 0,
      airdropped: totalDistributed.toString(),
      totalSupply: new Decimal(pool.totalMinted).minus(pool.totalBurned).toString(),
      note: `Distribusi airdrop '${schedule.title}' (${schedule.source}) ke ${participants.length} user`,
    }, { transaction });

    await transaction.commit();
    return { count: participants.length };
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error in distributeAirdrop:", error);
    throw error;
  }
};

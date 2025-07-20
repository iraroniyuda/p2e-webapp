const AirdropSchedule = require("../models/AirdropSchedule");
const AirdropParticipant = require("../models/AirdropParticipant");
const SbpSourceRule = require("../models/SbpSourceRule");
const SbpBalanceDetail = require("../models/SbpBalanceDetail");
const UserBalance = require("../models/UserBalance");
const { Op } = require("sequelize");

module.exports = async function distributeAirdrop(scheduleId) {
  const schedule = await AirdropSchedule.findByPk(scheduleId);
  if (!schedule) throw new Error("Airdrop schedule not found");
  if (schedule.isClosed) throw new Error("Airdrop already closed");

  const participants = await AirdropParticipant.findAll({
    where: { scheduleId, status: "APPROVED" },
  });

  const sbpRule = await SbpSourceRule.findOne({ where: { source: schedule.source } });
  const now = new Date();

  for (const p of participants) {
    let lockedUntil = null;
    if (sbpRule && sbpRule.locked && sbpRule.durationDays > 0) {
      lockedUntil = new Date(now.getTime() + sbpRule.durationDays * 86400000); // days to ms
    }

    // ✅ Tambah ke SbpBalanceDetail (log)
    await SbpBalanceDetail.create({
      userId: p.userId,
      source: schedule.source,
      amount: schedule.amountPerUser,
      lockedUntil,
    });

    // ✅ Tambah ke saldo utama SBP
    const [balance] = await UserBalance.findOrCreate({ where: { userId: p.userId } });
    await balance.increment("sbp", { by: schedule.amountPerUser });
  }

  await schedule.update({ isClosed: true });

  return { count: participants.length };
};

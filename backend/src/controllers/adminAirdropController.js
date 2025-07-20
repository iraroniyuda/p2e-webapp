const AirdropSchedule = require("../models/AirdropSchedule");
const AirdropParticipant = require("../models/AirdropParticipant");
const SbpSourceRule = require("../models/SbpSourceRule");
const User = require("../models/User");
const distributeAirdrop = require("../services/airdropDistributor");

// 🔹 GET /admin/airdrop/schedules
exports.listSchedules = async (req, res) => {
  try {
    const schedules = await AirdropSchedule.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json(schedules);
  } catch (err) {
    console.error("❌ Gagal ambil jadwal airdrop:", err);
    res.status(500).json({ error: "Gagal ambil jadwal airdrop" });
  }
};

// 🔹 GET /admin/airdrop/schedule/:id
exports.getScheduleDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const schedule = await AirdropSchedule.findByPk(id);
    if (!schedule) return res.status(404).json({ error: "Schedule tidak ditemukan" });

    const participants = await AirdropParticipant.findAll({
      where: { scheduleId: id },
      include: [{ model: User, as: "user", attributes: ["id", "username", "email"] }],
    });

    res.json({ schedule, participants });
  } catch (err) {
    console.error("❌ Gagal ambil detail schedule:", err);
    res.status(500).json({ error: "Gagal ambil detail schedule" });
  }
};

// 🔹 POST /admin/airdrop/:id/approve
exports.approveParticipants = async (req, res) => {
  const { id } = req.params;
  const { userIds } = req.body;
  try {
    const updated = await AirdropParticipant.update(
      { status: "APPROVED" },
      { where: { scheduleId: id, userId: userIds } }
    );
    res.json({ message: `✅ ${updated[0]} user(s) approved.` });
  } catch (err) {
    console.error("❌ Gagal approve peserta:", err);
    res.status(500).json({ error: "Gagal approve peserta" });
  }
};

// 🔹 POST /admin/airdrop/:id/distribute
exports.distributeAirdrop = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await distributeAirdrop(id);
    res.json({ message: `✅ Airdrop distributed to ${result.count} user(s)` });
  } catch (err) {
    console.error("❌ Error in distributeAirdrop:", err);
    res.status(500).json({ message: "Failed to distribute airdrop", error: err.message });
  }
};

// 🔹 POST /admin/airdrop/create
exports.createSchedule = async (req, res) => {
  try {
    const { title, description, amountPerUser, totalQuota, deadline, source } = req.body;

    const created = await AirdropSchedule.create({
      title,
      description,
      amountPerUser,
      totalQuota,
      deadline,
      source,
      isClosed: false,
    });

    res.json({ message: "✅ Airdrop berhasil dibuat", data: created });
  } catch (err) {
    console.error("❌ Gagal membuat schedule:", err);
    res.status(500).json({ error: "Gagal membuat schedule" });
  }
};

exports.editSchedule = async (req, res) => {
  const { id } = req.params;
  const { title, description, amountPerUser, totalQuota, deadline, source } = req.body;

  try {
    const schedule = await AirdropSchedule.findByPk(id);
    if (!schedule) return res.status(404).json({ error: "Schedule tidak ditemukan" });

    await schedule.update({
      title,
      description,
      amountPerUser,
      totalQuota,
      deadline,
      source,
    });

    res.json({ message: "✅ Schedule berhasil diperbarui", data: schedule });
  } catch (err) {
    console.error("❌ Gagal edit schedule:", err);
    res.status(500).json({ error: "Gagal edit schedule" });
  }
};

exports.deleteSchedule = async (req, res) => {
  const { id } = req.params;

  try {
    const schedule = await AirdropSchedule.findByPk(id);
    if (!schedule) return res.status(404).json({ error: "Schedule tidak ditemukan" });

    await AirdropParticipant.destroy({ where: { scheduleId: id } });
    await schedule.destroy();

    res.json({ message: "🗑️ Schedule berhasil dihapus beserta pesertanya" });
  } catch (err) {
    console.error("❌ Gagal hapus schedule:", err);
    res.status(500).json({ error: "Gagal hapus schedule" });
  }
};

// 🔹 GET /admin/airdrop/sources
exports.getAirdropSources = async (req, res) => {
  try {
    const sources = await SbpSourceRule.findAll({
      attributes: ["source"],
      order: [["source", "ASC"]],
    });

    res.json(sources.map((s) => s.source));
  } catch (err) {
    console.error("❌ Gagal ambil source rules:", err);
    res.status(500).json({ error: "Gagal ambil daftar sumber" }); 
  }
};


const ChampionshipRequest = require("../models/ChampionshipRequest");
const Championship = require("../models/Championship");
const ChampionshipParticipant = require("../models/ChampionshipParticipant");
const ChampionshipMatchGroup = require("../models/ChampionshipMatchGroup");
const ChampionshipGroupMember = require("../models/ChampionshipGroupMember");
const User = require("../models/User");
const { Decimal } = require("decimal.js");
const UserBalance = require("../models/UserBalance");
const SbpBalanceDetail = require("../models/SbpBalanceDetail");
const { Op } = require("sequelize");




// ✅ 1. Pengajuan Championship oleh Circuit Owner
const requestChampionship = async (req, res) => {
  try {
    const { title, description, scheduledAt } = req.body;
    const userId = req.user.id;

    const request = await ChampionshipRequest.create({
      userId,
      title,
      description,
      scheduledAt,
    });

    res.json(request);
  } catch (err) {
    console.error("❌ Gagal mengajukan championship", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ 2. Admin Approve + Setup Detail Championship
const approveChampionshipRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const {
      registrationFeeAmount,
      registrationFeeCurrency,
      rewardCurrency1,
      rewardAmount1,
      rewardCurrency2,
      rewardAmount2,
      rewardCurrency3,
      rewardAmount3,
      royaltyAmount,
      royaltyCurrency,
    } = req.body;

    const request = await ChampionshipRequest.findByPk(requestId);
    if (!request || request.status !== "pending") {
      return res.status(404).json({ error: "Request not found or already processed" });
    }

    const championship = await Championship.create({
      requestId: request.id,
      registrationFeeAmount,
      registrationFeeCurrency,
      rewardCurrency1,
      rewardAmount1,
      rewardCurrency2,
      rewardAmount2,
      rewardCurrency3,
      rewardAmount3,
      royaltyAmount,
      royaltyCurrency,
      status: "upcoming",
      rewardGiven: false,
      royaltyGiven: false,
    });

    await request.update({ status: "approved" });

    res.json(championship);
  } catch (err) {
    console.error("❌ Gagal menyetujui championship", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


// ✅ 3. User daftar championship
const registerToChampionship = async (req, res) => {
  try {
    const { championshipId } = req.body;
    const userId = req.user.id;

    // 1. Cek apakah sudah mendaftar
    const existing = await ChampionshipParticipant.findOne({
      where: { championshipId, userId },
    });
    if (existing) {
      return res.status(400).json({ error: "Sudah mendaftar" });
    }

    // 2. Ambil data championship & request
    const championship = await Championship.findByPk(championshipId, {
      include: [{ model: ChampionshipRequest, as: "request" }],
    });
    if (!championship || championship.status !== "upcoming") {
      return res.status(400).json({ error: "Championship tidak valid atau belum dibuka" });
    }

    // 3. Tidak boleh daftar ke championship sendiri
    if (championship.request.userId === userId) {
      return res.status(403).json({ error: "Tidak bisa mendaftar ke championship sendiri" });
    }

    const feeAmount = new Decimal(championship.registrationFeeAmount);
    const feeCurrency = (championship.registrationFeeCurrency || "").toLowerCase(); // "sbp" atau "race"

    // 4. Ambil saldo user
    const balance = await UserBalance.findOne({ where: { userId } });
    if (!balance) {
      return res.status(404).json({ error: "Saldo tidak ditemukan" });
    }

    // 5. Proses potong saldo
    if (feeCurrency === "sbp") {
      const sbp = new Decimal(balance.sbp || 0);
      const sbpAvailable = new Decimal(balance.sbpAvailable || 0);

      // ✅ Cek keduanya harus cukup
      if (sbp.lt(feeAmount) || sbpAvailable.lt(feeAmount)) {
        return res.status(400).json({ error: "Saldo SBP tidak cukup" });
      }

      balance.sbp = sbp.minus(feeAmount).toFixed();
      balance.sbpAvailable = sbpAvailable.minus(feeAmount).toFixed();

      // Catat ke SbpBalanceDetail
      await SbpBalanceDetail.create({
        userId,
        source: "championship_registration",
        amount: feeAmount.negated().toFixed(), // minus
      });

    } else if (feeCurrency === "race") {
      const race = new Decimal(balance.race || 0);
      if (race.lt(feeAmount)) {
        return res.status(400).json({ error: "Saldo RACE tidak cukup" });
      }
      balance.race = race.minus(feeAmount).toFixed();

    } else {
      return res.status(400).json({ error: "Tipe mata uang tidak dikenali" });
    }

    await balance.save();

    // 6. Simpan peserta
    const participant = await ChampionshipParticipant.create({
      championshipId,
      userId,
      status: "pending",
      paidAmount: feeAmount,
      paidCurrency: feeCurrency,
    });

    res.json(participant);
  } catch (err) {
    console.error("❌ Gagal daftar championship", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


// ✅ 4. Circuit Owner menyetujui peserta
const approveOrRejectParticipant = async (req, res) => {
  try {
    const { id } = req.params; // participant ID
    const { action } = req.body; // "approve" / "reject"

    const participant = await ChampionshipParticipant.findByPk(id);
    if (!participant) {
      return res.status(404).json({ error: "Peserta tidak ditemukan" });
    }

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ error: "Aksi tidak valid" });
    }

    // Jika reject, kembalikan saldo
    if (action === "reject") {
      const balance = await UserBalance.findOne({ where: { userId: participant.userId } });
      if (!balance) {
        return res.status(404).json({ error: "Saldo user tidak ditemukan" });
      }

      const refundAmount = new Decimal(participant.paidAmount || 0);
      const currency = (participant.paidCurrency || "").toLowerCase();

      if (currency === "sbp") {
        balance.sbpAvailable = balance.sbpAvailable.plus(refundAmount).toFixed();
      } else if (currency === "race") {
        balance.race = balance.race.plus(refundAmount).toFixed();
      } else {
        return res.status(400).json({ error: "Tipe mata uang peserta tidak valid" });
      }

      await balance.save();
    }

    // Update status
    await participant.update({
      status: action === "approve" ? "approved" : "rejected",
    });

    res.json(participant);
  } catch (err) {
    console.error("❌ Gagal mengubah status peserta", err);
    res.status(500).json({ error: "Internal server error" });
  }
};



// ✅ Ambil semua championship milik circuit owner ini
const getMyChampionships = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("🔍 Fetching championships for userId:", userId);

    const championships = await Championship.findAll({
      include: [
        {
          model: ChampionshipRequest,
          as: "request",
          where: { userId },
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(championships);
  } catch (err) {
    console.error("❌ Gagal ambil championship milik user", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


const getUpcomingChampionships = async (req, res) => {
  try {
    const championships = await Championship.findAll({
      where: { status: "upcoming" },
      include: [
        {
          model: ChampionshipRequest,
          as: "request",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(championships);
  } catch (err) {
    console.error("❌ Gagal ambil championship upcoming", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getPendingChampionshipRequests = async (req, res) => {
  try {
    const pendingRequests = await ChampionshipRequest.findAll({
      where: { status: "pending" },
      order: [["createdAt", "DESC"]],
    });

    res.json(pendingRequests);
  } catch (err) {
    console.error("❌ Gagal ambil request championship pending", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getChampionshipParticipants = async (req, res) => {
  try {
    const { championshipId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin"; // atau sesuai struktur JWT-mu

    const championship = await Championship.findByPk(championshipId, {
      include: [{ model: ChampionshipRequest, as: "request" }],
    });

    // ⛔ Sebelumnya hanya owner
    // ✅ Sekarang: owner atau admin boleh
    if (!championship || (!isAdmin && championship.request.userId !== userId)) {
      return res.status(403).json({ error: "Tidak diizinkan melihat peserta championship ini" });
    }

    const participants = await ChampionshipParticipant.findAll({
      where: { championshipId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "email"],
        },
      ],
    });

    res.json(participants);
  } catch (err) {
    console.error("❌ Gagal ambil peserta championship", err);
    res.status(500).json({ error: "Internal server error" });
  }
};



const getAllChampionships = async (req, res) => {
  try {
    const championships = await Championship.findAll({
      where: {
        status: { [Op.ne]: "finished" } // ⬅️ hanya status BUKAN finished
      },
      include: [
        {
          model: ChampionshipRequest,
          as: "request",
          attributes: ["title", "scheduledAt"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(championships);
  } catch (err) {
    console.error("❌ Gagal ambil semua championship", err);
    res.status(500).json({ error: "Internal server error" });
  }
};




module.exports = {
  requestChampionship,
  approveChampionshipRequest,
  registerToChampionship,
  approveOrRejectParticipant,
  getMyChampionships,
  getUpcomingChampionships,
  getPendingChampionshipRequests,
  getChampionshipParticipants,
  getAllChampionships
};


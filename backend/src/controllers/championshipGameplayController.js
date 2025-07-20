const { Op } = require("sequelize");
const Championship = require("../models/Championship");
const ChampionshipParticipant = require("../models/ChampionshipParticipant");
const ChampionshipMatchGroup = require("../models/ChampionshipMatchGroup");
const ChampionshipGroupMember = require("../models/ChampionshipGroupMember");
const ChampionshipRequest = require("../models/ChampionshipRequest");
const UserBalance = require("../models/UserBalance");
const Decimal = require("decimal.js");
const User = require("../models/User");
const ChampionshipRoomStatus = require("../models/ChampionshipRoomStatus");
const ChampionshipPhasePromotionPool = require("../models/ChampionshipPhasePromotionPool");
const UserOwnedCustomizationParts = require("../models/UserOwnedCustomizationParts");
const UserCarCustomization = require("../models/UserCarCustomization");


const assignPhaseGroups = async (req, res) => {
  try {
    const { championshipId } = req.params;
    const { phase, maxPerGroup } = req.body;

    if (!["qualifier", "semifinal", "final", "grand_final"].includes(phase)) {
      return res.status(400).json({ error: "Fase tidak valid" });
    }
    if (!maxPerGroup || isNaN(maxPerGroup) || maxPerGroup < 1) {
      return res.status(400).json({ error: "maxPerGroup tidak valid" });
    }

    const championship = await Championship.findByPk(championshipId, {
      include: [{ model: ChampionshipRequest, as: "request" }],
    });
    if (!championship) {
      return res.status(404).json({ error: "Championship tidak ditemukan" });
    }

    // Cek apakah grup untuk fase ini sudah ada
    const existing = await ChampionshipMatchGroup.findOne({
      where: { championshipId, phase },
    });
    if (existing) {
      return res.status(400).json({ error: `Fase '${phase}' sudah dibuat sebelumnya` });
    }

    // Ambil kandidat peserta
    let candidates = [];
    if (phase === "qualifier") {
      // Ambil dari peserta approved
      candidates = await ChampionshipParticipant.findAll({
        where: { championshipId, status: "approved" },
        attributes: ["userId"],
      });
      candidates = candidates.map(c => ({ userId: c.userId }));
    } else {
      // Ambil dari pool
      const pool = await ChampionshipPhasePromotionPool.findAll({
        where: { championshipId, phase },
      });
      if (!pool || pool.length === 0) {
        return res.status(400).json({ error: `Pool peserta untuk fase ${phase} kosong, lakukan promosi dulu!` });
      }
      candidates = pool.map((e) => ({ userId: e.userId }));
    }

    if (candidates.length === 0) {
      return res.status(400).json({ error: "Tidak ada peserta untuk fase ini" });
    }

    // Shuffle peserta
    const shuffled = candidates.sort(() => 0.5 - Math.random());

    // Hitung grup
    const groupCount = Math.ceil(shuffled.length / maxPerGroup);
    let idx = 0;

    for (let i = 1; i <= groupCount; i++) {
      const group = await ChampionshipMatchGroup.create({
        championshipId,
        phase,
        groupNumber: i,
        status: "waiting",
      });

      const members = shuffled.slice(idx, idx + maxPerGroup);
      idx += maxPerGroup;

      for (const m of members) {
        await ChampionshipGroupMember.create({
          matchGroupId: group.id,
          userId: m.userId,
        });
      }
    }

    // Kosongkan pool setelah assign
    if (phase !== "qualifier") {
      await ChampionshipPhasePromotionPool.destroy({
        where: { championshipId, phase }
      });
    }

    if (phase === "qualifier" && championship.status === "upcoming") {
      await championship.update({ status: "ongoing" });
    }

    res.json({
      message: `✅ ${groupCount} grup berhasil dibuat untuk fase '${phase}'`,
      totalParticipants: candidates.length,
      maxPerGroup,
    });
  } catch (err) {
    console.error("❌ Gagal assign grup fase championship", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getPromotionPoolForPhase = async (req, res) => {
  const { championshipId } = req.params;
  const { phase } = req.query;
  try {
    const pool = await ChampionshipPhasePromotionPool.findAll({
      where: { championshipId, phase },
      include: [{ model: User, as: "user", attributes: ["id", "username", "email"] }]
    });
    res.json(pool.map(p => ({
      userId: p.userId,
      promotedAt: p.promotedAt,
      user: p.user, // jika include user
    })));
  } catch (err) {
    console.error("❌ Gagal get promotion pool", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllGroups = async (req, res) => {
  try {
    const groups = await ChampionshipMatchGroup.findAll({
      where: { status: "waiting" },
      include: [
        {
          model: ChampionshipGroupMember,
          as: "members",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "username", "email"],
            },
          ],
        },
        {
          model: ChampionshipRoomStatus,
          as: "roomStatus",
        },
      ],
    });

    // Ubah jadi bentuk ringan
    const simplified = groups.map((g) => ({
      id: g.id,
      championshipId: g.championshipId,
      phase: g.phase,
      groupNumber: g.groupNumber,
      isReady: false, // Default, akan diganti client saat parsing membernya
      members: g.members.map((m) => ({
        userId: m.userId,
        isReady: m.isReady,
        user: {
          id: m.user.id,
          username: m.user.username,
          email: m.user.email,
        },
      })),
      roomStatus: g.roomStatus ? {
        isRaceStarted: g.roomStatus.isRaceStarted,
        joinedUserIds: g.roomStatus.joinedUserIds,
      } : null,
    }));

    res.json(simplified);

  } catch (err) {
    console.error("❌ Gagal ambil semua grup championship (admin):", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllRooms = async (req, res) => {
  try {
    // === FIX PENTING: definisikan relasi di sini (jika belum ada) ===
    if (!ChampionshipRoomStatus.associations.group) {
      ChampionshipRoomStatus.belongsTo(ChampionshipMatchGroup, { as: "group", foreignKey: "matchGroupId" });
    }
    // === END FIX ===

    const rooms = await ChampionshipRoomStatus.findAll({
      where: { isRaceStarted: false },
      include: [{
        model: ChampionshipMatchGroup,
        as: "group",
        attributes: ["id", "groupNumber", "phase", "championshipId"],
      }],
      order: [["createdAt", "ASC"]],
    });


    const result = rooms.map(room => ({
      roomId: room.id,
      groupId: room.group?.id,
      groupNumber: room.group?.groupNumber,
      phase: room.group?.phase,
      championshipId: room.group?.championshipId,
      isRaceStarted: room.isRaceStarted,
      joinedUserIds: room.joinedUserIds,
    }));

    res.json(result);
  } catch (err) {
    console.error("❌ Gagal ambil rooms:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};



const clearPendingCommand = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await ChampionshipMatchGroup.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group tidak ditemukan" });
    }

    group.pendingCommand = null;
    await group.save();

    res.json({ message: "✅ pendingCommand direset" });
  } catch (err) {
    console.error("❌ Gagal reset pendingCommand", err);
    res.status(500).json({ error: "Internal server error" });
  }
};



const createRoomForGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId;

    // Cek group
    const group = await ChampionshipMatchGroup.findByPk(groupId);
    if (!group) return res.status(404).json({ error: "Group tidak ditemukan" });

    // Cek sudah ada room status atau belum
    let room = await ChampionshipRoomStatus.findOne({ where: { matchGroupId: groupId } });
    if (room) {
      return res.status(400).json({ error: "Room untuk grup ini sudah dibuat" });
    }

    // Buat room baru
    room = await ChampionshipRoomStatus.create({
      matchGroupId: groupId,
      isRaceStarted: false,
      joinedUserIds: [],
    });

    // (Opsional) juga set pendingCommand, kalau Unity perlu polling
    group.pendingCommand = "open_create_room";
    await group.save();

    return res.json({ success: true, message: "Room berhasil dibuat", room });
  } catch (err) {
    console.error("❌ Gagal createRoomForGroup", err);
    return res.status(500).json({ error: "Gagal set command" });
  }
};

const joinRoom = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // === CEK apakah userId anggota grup ===
    const isMember = await ChampionshipGroupMember.findOne({
      where: { matchGroupId: groupId, userId }
    });

    if (!isMember) {
      return res.status(403).json({ error: "Kamu BUKAN anggota grup ini." });
    }

    // Lanjutkan proses join jika memang anggota
    const room = await ChampionshipRoomStatus.findOne({ where: { matchGroupId: groupId } });
    if (!room) {
      return res.status(404).json({ error: "Room belum dibuat untuk grup ini" });
    }

    const joined = room.joinedUserIds || [];

    if (!joined.includes(userId)) {
      joined.push(userId);
      room.joinedUserIds = joined;
      await room.save();
    }

    res.json({
      message: "✅ Berhasil join room",
      joinedUserIds: room.joinedUserIds,
    });
  } catch (err) {
    console.error("❌ Gagal join room", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getRoomStatus = async (req, res) => {
  try {
    const { groupId } = req.params;

    const room = await ChampionshipRoomStatus.findOne({ where: { matchGroupId: groupId } });
    if (!room) {
      return res.status(404).json({ error: "Room belum dibuat untuk grup ini" });
    }

    // Ambil data user yang sudah join
    const joinedUserIds = room.joinedUserIds || [];

    const joinedUsers = await User.findAll({
      where: { id: joinedUserIds },
      attributes: ["id", "username", "email"],
    });

    // (Opsional) ambil semua anggota grup
    const allMembers = await ChampionshipGroupMember.findAll({
      where: { matchGroupId: groupId },
      include: [{ model: User, as: "user", attributes: ["id", "username", "email"] }],
    });

    res.json({
      isRaceStarted: room.isRaceStarted,
      joinedUsers,
      allMembers,
    });
  } catch (err) {
    console.error("❌ Gagal ambil status room", err);
    res.status(500).json({ error: "Internal server error" });
  }
};




const startGroupRace = async (req, res) => {
  try {
    const groupId = req.params.groupId;

    // Update status group ke "ongoing"
    const group = await ChampionshipMatchGroup.findByPk(groupId);
    if (!group) return res.status(404).json({ error: "Group tidak ditemukan" });

    group.status = "ongoing";
    await group.save();

    // Update isRaceStarted di RoomStatus
    const roomStatus = await ChampionshipRoomStatus.findOne({
      where: { matchGroupId: groupId },
    });
    if (roomStatus) {
      roomStatus.isRaceStarted = true;
      await roomStatus.save();
    }

    return res.json({ success: true, message: "Race dimulai" });
  } catch (err) {
    console.error("❌ Gagal startGroupRace", err);
    return res.status(500).json({ error: "Gagal memulai race" });
  }
};



// --- Helper findPart ---
const findPart = async (userId, assetId, partType, value) => {
  const stringValue = String(value).toUpperCase();
  const exact = await UserOwnedCustomizationParts.findOne({
    where: { userId, assetId, partType, value: stringValue },
  });
  if (exact) return exact;
  // fallback: durability tertinggi
  const fallback = await UserOwnedCustomizationParts.findOne({
    where: { userId, assetId, partType },
    order: [["durability", "DESC"], ["value", "DESC"]],
  });
  return fallback;
};

// --- Helper reset field kustomisasi ke default kalau durability habis ---
const statParts = ["engine", "brake", "handling", "speed"];
const visualParts = [
  "spoiler", "wheel", "siren", "neonIndex",
  "decalIndexFront", "decalIndexBack", "decalIndexLeft", "decalIndexRight"
];

async function resetCustomizationFieldIfNeeded(userId, assetId, partType) {
  const updateFields = {};
  if (statParts.includes(partType)) {
    updateFields[partType + "Level"] = 0;
    updateFields[partType + "Price"] = 0;
  }
  if (visualParts.includes(partType)) {
    updateFields[partType] = -1;
  }
  if (partType === "paint") updateFields.paint = "#000000";
  if (partType === "headlightColor") updateFields.headlightColor = "#FFFFFF";
  if (partType === "wheelSmokeColor") updateFields.wheelSmokeColor = "#FFFFFF";
  if (Object.keys(updateFields).length > 0) {
    await UserCarCustomization.update(updateFields, { where: { userId, assetId } });
  }
}

// --- Endpoint Championship + durability logic ---
// ... (require model ChampionshipGroupMember, dsb)
const submitGroupResult = async (req, res) => {
  const userId = req.user.id;
  const groupId = req.params.groupId;
  const { position, time, assetId, partsUsed } = req.body;

  try {
    const member = await ChampionshipGroupMember.findOne({
      where: { matchGroupId: groupId, userId },
    });

    if (!member) {
      return res.status(404).json({ error: "Kamu bukan anggota grup ini." });
    }

    // Simpan hasil race
    member.resultPosition = position;
    member.finishTime = time;
    await member.save();

    // --- DURABILITY LOGIC: full di sini ---
    let updatedDurabilities = [];
    const tryProcessPart = async ({ partType, value }) => {
      try {
        const part = await findPart(userId, assetId, partType, value);
        if (!part) return;
        if (part.durability > 0) {
          part.durability -= 1;
          await part.save();
        }
        if (part.durability === 0) {
          await part.destroy();
          await resetCustomizationFieldIfNeeded(userId, assetId, partType);
        }
        updatedDurabilities.push({
          partType,
          value: part.value,
          durability: part.durability,
        });
      } catch (err) {
        console.error(`❌ Gagal proses durability untuk ${partType}:${value} –`, err);
      }
    };

    if (Array.isArray(partsUsed)) {
      for (const part of partsUsed) {
        await tryProcessPart(part);
      }
    }

    res.json({ success: true, message: "Hasil disimpan.", updatedDurabilities });
  } catch (err) {
    console.error("❌ Gagal submit hasil:", err);
    res.status(500).json({ error: "Gagal menyimpan hasil." });
  }
};


const promoteTopParticipants = async (req, res) => {
  try {
    const { championshipId, fromPhase, toPhase, topNPerGroup } = req.body;

    // Validasi fase
    const validFrom = ["qualifier", "semifinal", "final"];
    const validTo = ["semifinal", "final", "grand_final"];
    if (!validFrom.includes(fromPhase) || !validTo.includes(toPhase)) {
      return res.status(400).json({ error: "Fase tidak valid" });
    }

    // Validasi topNPerGroup
    const topN = Number(topNPerGroup);
    if (!topN || isNaN(topN) || topN < 1) {
      return res.status(400).json({ error: "topNPerGroup tidak valid" });
    }

    const championship = await Championship.findByPk(championshipId);
    if (!championship) {
      return res.status(404).json({ error: "Championship tidak ditemukan" });
    }

    // Ambil semua grup dari fromPhase yang status "done" beserta membernya
    const fromGroups = await ChampionshipMatchGroup.findAll({
      where: { championshipId, phase: fromPhase, status: "done" },
      include: [{ model: ChampionshipGroupMember, as: "members" }],
    });

    if (fromGroups.length === 0) {
      return res.status(400).json({ error: `Belum ada grup selesai di fase ${fromPhase}` });
    }

    // Ambil user yang lolos dari tiap grup
    let promotedUserIds = [];
    for (const group of fromGroups) {
      const eligibleMembers = group.members
        .filter(
          (m) =>
            m.resultPosition !== null &&
            m.resultPosition !== undefined &&
            m.finishTime !== null &&
            m.finishTime !== undefined
        )
        .sort((a, b) => a.resultPosition - b.resultPosition);

      if (topN > eligibleMembers.length) {
        return res.status(400).json({
          error: `Top N (${topN}) melebihi jumlah peserta finish di group #${group.groupNumber} (hanya ${eligibleMembers.length} peserta yang finish).`,
        });
      }
      promotedUserIds.push(...eligibleMembers.slice(0, topN).map((m) => m.userId));
    }

    if (promotedUserIds.length === 0) {
      return res.status(400).json({ error: "Tidak ada peserta untuk dipromosikan" });
    }

    // Masukkan ke pool (jika belum ada)
    for (const userId of promotedUserIds) {
      await ChampionshipPhasePromotionPool.findOrCreate({
        where: { championshipId, phase: toPhase, userId },
        defaults: { promotedAt: new Date() }
      });
    }

    res.json({ promotedUserIds, message: `✅ ${promotedUserIds.length} peserta dipromosikan ke pool fase ${toPhase}` });
  } catch (err) {
    console.error("❌ Gagal promosi peserta", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const completeGrandFinalAndReward = async (req, res) => {
  try {
    // Dapatkan id dari route param
    const { id } = req.params;
    const championshipId = +id;

    const championship = await Championship.findByPk(championshipId, {
      include: [{ model: ChampionshipRequest, as: "request" }],
    });

    if (!championship || championship.status !== "ongoing") {
      return res.status(400).json({ error: "Championship tidak valid atau belum masuk tahap final" });
    }

    if (championship.rewardGiven || championship.royaltyGiven) {
      return res.status(400).json({ error: "Reward dan/atau royalti sudah diberikan sebelumnya" });
    }

    const grandFinalGroup = await ChampionshipMatchGroup.findOne({
      where: {
        championshipId,
        phase: "grand_final",
        status: "done",
      },
    });

    if (!grandFinalGroup) {
      return res.status(404).json({ error: "Grand final belum selesai" });
    }

    const top3 = await ChampionshipGroupMember.findAll({
      where: { matchGroupId: grandFinalGroup.id },
      order: [["resultPosition", "ASC"]],
      limit: 3,
    });


    if (top3.length < 3) {
      return res.status(400).json({ error: "Belum ada cukup pemenang di grand final" });
    }

    const [winner1, winner2, winner3] = top3;

    const hadiahMap = {
      [winner1.userId]: { currency: championship.rewardCurrency1, amount: championship.rewardAmount1 },
      [winner2.userId]: { currency: championship.rewardCurrency2, amount: championship.rewardAmount2 },
      [winner3.userId]: { currency: championship.rewardCurrency3, amount: championship.rewardAmount3 },
    };

    for (const [userId, reward] of Object.entries(hadiahMap)) {
      if (!reward.currency || !reward.amount) continue;
      const balance = await UserBalance.findOne({ where: { userId } });
      const field = reward.currency.toLowerCase();
      balance[field] = new Decimal(balance[field] || 0).plus(reward.amount).toFixed();
      await balance.save();
    }

    const ownerId = championship.request.userId;
    const kompensasiField = championship.royaltyCurrency?.toLowerCase?.();
    if (championship.royaltyAmount && kompensasiField) {
      const kompensasiBalance = await UserBalance.findOne({ where: { userId: ownerId } });
      kompensasiBalance[kompensasiField] = new Decimal(kompensasiBalance[kompensasiField] || 0)
        .plus(championship.royaltyAmount)
        .toFixed();
      await kompensasiBalance.save();
    }

    await championship.update({
      status: "finished",
      rewardGiven: true,
      royaltyGiven: true,
    });

    res.json({
      message: "🏁 Championship selesai! Juara ditentukan dan hadiah dibagikan.",
      juara: [
        { position: 1, userId: winner1.userId },
        { position: 2, userId: winner2.userId },
        { position: 3, userId: winner3.userId },
      ],
    });
  } catch (err) {
    console.error("❌ Gagal menyelesaikan championship", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getGrandFinalWinnersPreview = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await ChampionshipMatchGroup.findOne({
      where: { championshipId: id, phase: 'grand_final', status: 'done' }
    });
    if (!group) return res.status(404).json({ error: "Grand final belum selesai" });

    const championship = await Championship.findByPk(id, {
      include: [{
        model: ChampionshipRequest,
        as: "request",
        include: [
          {
            model: User,
            as: "user", // circuit owner
            attributes: ["id", "username", "email"]
          }
        ]
      }]
    });


    // Ambil top 3 grand final, join User
    const winners = await ChampionshipGroupMember.findAll({
      where: { matchGroupId: group.id, resultPosition: { [Op.not]: null } },
      include: [
        { model: User, as: "user", attributes: ["id", "username", "email"] },
      ],
      order: [["resultPosition", "ASC"]],
      limit: 3,
    });

    // Map reward ke masing-masing posisi
    const rewardMap = [
      { currency: championship.rewardCurrency1, amount: championship.rewardAmount1 },
      { currency: championship.rewardCurrency2, amount: championship.rewardAmount2 },
      { currency: championship.rewardCurrency3, amount: championship.rewardAmount3 },
    ];

    res.json({
      winners: winners.map((m, idx) => ({
        userId: m.userId,
        username: m.user?.username,
        email: m.user?.email,
        position: m.resultPosition,
        rewardCurrency: rewardMap[idx]?.currency || null,
        rewardAmount: rewardMap[idx]?.amount || null,
      })),
      royaltyAmount: championship.royaltyAmount,
      royaltyCurrency: championship.royaltyCurrency,
      ownerUsername: championship.request?.user?.username || null,
      ownerEmail: championship.request?.user?.email || null,
    });
  } catch (err) {
    res.status(500).json({ error: "Gagal ambil data preview juara" });
  }
};


const getMatchGroups = async (req, res) => {
  const { championshipId } = req.params;
  const { phase } = req.query;
  const userId = req.user.id;
  const isAdmin = req.user.role === "admin";

  // ⛔ Tambahkan validasi untuk mencegah error
  if (championshipId === "all") {
    return res.status(400).json({ error: "Invalid championship ID: 'all' is not allowed here" });
  }

  try {
    const championship = await Championship.findByPk(championshipId, {
      include: [{ model: ChampionshipRequest, as: "request" }],
    });

    if (!championship || (!isAdmin && championship.request.userId !== userId)) {
      return res.status(403).json({ error: "Bukan pemilik championship ini" });
    }

    const groups = await ChampionshipMatchGroup.findAll({
      where: { championshipId, phase },
      include: [
        {
          model: ChampionshipGroupMember,
          as: "members",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "username", "email"],
            },
          ],
        },
      ],
    });

    res.json(groups);
  } catch (err) {
    console.error("❌ Gagal ambil grup", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMyGroups = async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";

    let groups = [];

    if (isAdmin) {
      // ADMIN: Ambil semua grup yang sudah ada room-nya!
      groups = await ChampionshipMatchGroup.findAll({
        include: [
          {
            model: ChampionshipRoomStatus,
            as: "roomStatus",
            required: true, // Hanya yang sudah ada room-nya
          },
          {
            model: ChampionshipGroupMember,
            as: "members",
            include: [
              {
                model: User,
                as: "user",
                attributes: ["id", "username", "email"],
              },
            ],
          },
        ],
      });

      // Format response untuk admin
      const result = groups.map((group) => ({
        id: group.id,
        championshipId: group.championshipId,
        phase: group.phase,
        groupNumber: group.groupNumber,
        members: group.members.map((m) => ({
          userId: m.userId,
          isReady: m.isReady || false,
          user: m.user,
        })),
      }));

      return res.json(result);
    } else {
      // USER: Ambil grup yang diikuti user yang sudah ada room-nya
      const myMemberships = await ChampionshipGroupMember.findAll({
        where: { userId },
        include: [
          {
            model: ChampionshipMatchGroup,
            as: "group",
            required: true,
            where: { status: "waiting" },
            include: [
              {
                model: ChampionshipRoomStatus,
                as: "roomStatus",
                required: true,
                where: { isRaceStarted: false },
              },
              {
                model: ChampionshipGroupMember,
                as: "members",
                include: [
                  { model: User, as: "user", attributes: ["id", "username", "email"] }
                ]
              }
            ]
          }
        ]
      });


      // Format response untuk user biasa
      const result = myMemberships.map((membership) => {
        const group = membership.group;
        return {
          id: group.id,
          championshipId: group.championshipId,
          phase: group.phase,
          groupNumber: group.groupNumber,
          myUserId: userId,
          isReady: membership.isReady || false,
          members: group.members.map((m) => ({
            userId: m.userId,
            isReady: m.isReady || false,
            user: m.user,
          })),
        };
      });

      return res.json(result);
    }
  } catch (err) {
    console.error("❌ Gagal ambil grup saya", err);
    res.status(500).json({ error: "Gagal ambil grup saya" });
  }
};

const completeGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await ChampionshipMatchGroup.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group tidak ditemukan" });
    }
    if (group.status !== "ongoing") {
      return res.status(400).json({ error: "Group belum/sudah selesai" });
    }
    group.status = "done";
    await group.save();
    res.json({ success: true, message: "Group berhasil diselesaikan" });
  } catch (err) {
    console.error("❌ Gagal menyelesaikan group:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


const getAllMyGroups = async (req, res) => {
  try {
    const userId = req.user.id;
    const myMemberships = await ChampionshipGroupMember.findAll({
      where: { userId },
      include: [
        {
          model: ChampionshipMatchGroup,
          as: "group",
          include: [
            {
              model: ChampionshipGroupMember,
              as: "members",
              include: [{ model: User, as: "user", attributes: ["id", "username", "email"] }],
            },
          ],
        },
      ],
    });

    const result = myMemberships.map((membership) => {
      const group = membership.group;
      return {
        id: group.id,
        championshipId: group.championshipId,
        phase: group.phase,
        groupNumber: group.groupNumber,
        myUserId: userId,
        isReady: membership.isReady || false,
        members: group.members.map((m) => ({
          userId: m.userId,
          isReady: m.isReady || false,
          user: m.user,
        })),
      };
    });

    res.json(result);
  } catch (err) {
    console.error("❌ Gagal ambil semua grup saya", err);
    res.status(500).json({ error: "Gagal ambil semua grup saya" });
  }
};


const setUserReadyStatus = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const { isReady } = req.body;

    const member = await ChampionshipGroupMember.findOne({
      where: { matchGroupId: groupId, userId },
    });

    if (!member) {
      return res.status(404).json({ error: "Peserta tidak ditemukan dalam grup ini" });
    }

    member.isReady = isReady;
    await member.save();

    res.json({ message: `✅ Ready status diperbarui`, isReady });
  } catch (err) {
    console.error("❌ Gagal update ready status", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


const getMissingRoomUsers = async (req, res) => {
  try {
    const { groupId } = req.params;

    const room = await ChampionshipRoomStatus.findOne({ where: { matchGroupId: groupId } });
    const joinedUserIds = room?.joinedUserIds || [];

    const members = await ChampionshipGroupMember.findAll({
      where: { matchGroupId: groupId },
      include: [{ model: User, as: "user", attributes: ["id", "username", "email"] }],
    });

    const missing = members.filter((m) => !joinedUserIds.includes(m.userId));

    res.json({
      missingUsers: missing.map((m) => m.user),
    });
  } catch (err) {
    console.error("❌ Gagal ambil missing users", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const resetRoom = async (req, res) => {
  try {
    const { groupId } = req.params;

    const room = await ChampionshipRoomStatus.findOne({ where: { matchGroupId: groupId } });
    if (!room) return res.status(404).json({ error: "Room tidak ditemukan" });

    await room.destroy();

    res.json({ message: "✅ Room berhasil dihapus. Bisa dibuat ulang." });
  } catch (err) {
    console.error("❌ Gagal reset room", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMyActiveGroup = async (req, res) => {
  try {
    const userId = req.user.id;

    // Cari member yang sesuai user dan group-nya masih "waiting"
    const membership = await ChampionshipGroupMember.findOne({
      where: { userId },
      include: [
        {
          model: ChampionshipMatchGroup,
          as: "group",
          required: true,
          where: { status: "waiting" },
          include: [
            {
              model: ChampionshipGroupMember,
              as: "members",
              include: [
                {
                  model: User,
                  as: "user",
                  attributes: ["id", "username", "email"]
                }
              ],
            },
            {
              model: ChampionshipRoomStatus,
              as: "roomStatus",
            },
          ],
        },
      ],
    });


    if (!membership || !membership.group) {
      return res.json({ activeGroup: null });
    }

    const group = membership.group;

    const response = {
      id: group.id,
      championshipId: group.championshipId,
      phase: group.phase,
      groupNumber: group.groupNumber,
      isReady: membership.isReady || false,
      isRaceStarted: group.roomStatus?.isRaceStarted || false,
      pendingCommand: group.pendingCommand || null,
      members: group.members.map((m) => ({
        userId: m.userId,
        isReady: m.isReady || false,
        user: m.user,
      })),
    };

    res.json({ activeGroup: response });

  } catch (err) {
    console.error("❌ Gagal ambil grup aktif saya", err);
    res.status(500).json({ error: "Internal server error" });
  }
};




const getParticipantsByPhase = async (req, res) => {
  try {
    const { championshipId } = req.params;
    const { phase } = req.query;

    const isValidPhase = ["qualifier", "semifinal", "final", "grand_final"].includes(phase);
    if (!isValidPhase) {
      return res.status(400).json({ error: "Fase tidak valid" });
    }

    const groups = await ChampionshipMatchGroup.findAll({
      where: { championshipId, phase },
      include: [
        {
          model: ChampionshipGroupMember,
          as: "members",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "username", "email"],
            },
          ],
        },
      ],
      order: [["groupNumber", "ASC"]],
    });

    const result = groups.map((group) => ({
      groupId: group.id,
      groupNumber: group.groupNumber,
      phase: group.phase,
      status: group.status,
      members: group.members.map((m) => ({
        userId: m.userId,
        position: m.resultPosition,   // Ganti ke resultPosition
        time: m.finishTime,           // Ganti ke finishTime
        user: m.user,
      })),
    }));

    res.json(result);
  } catch (err) {
    console.error("❌ Gagal ambil peserta per fase", err);
    res.status(500).json({ error: "Internal server error" });
  }
};



// controller
const triggerOpenInUnity = async (req, res) => {
  const { groupId } = req.params;

  // Simpan perintah yang bisa dipantau Unity
  const group = await ChampionshipMatchGroup.findByPk(groupId);
  if (!group) return res.status(404).json({ error: "Group tidak ditemukan" });

  group.pendingCommand = "open_create_room";
  await group.save();

  res.json({ message: "✅ Perintah dikirim ke Unity untuk buka CreateRoomPanel." });
};



module.exports = {
    assignPhaseGroups,
    getPromotionPoolForPhase,
    createRoomForGroup,
    joinRoom,
    getRoomStatus,
    startGroupRace,
    submitGroupResult,
    promoteTopParticipants,
    completeGrandFinalAndReward,
    getMatchGroups,
    getMyGroups,
    setUserReadyStatus,
    getMissingRoomUsers,
    resetRoom,
    getMyActiveGroup,
    getParticipantsByPhase,
    triggerOpenInUnity,
    getAllGroups,
    clearPendingCommand,
    getAllRooms,
    getAllMyGroups,
    completeGroup,
    getGrandFinalWinnersPreview
};
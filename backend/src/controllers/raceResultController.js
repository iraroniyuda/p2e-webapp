const UserInventoryRace = require("../models/UserInventoryRace");
const UserRaceResult = require("../models/UserRaceResult");
const RaceSession = require("../models/RaceSession");
const UserOwnedCustomizationParts = require("../models/UserOwnedCustomizationParts");
const grantSbpWithSource = require("../utils/grantSbpWithSource");
const CarRaceRewardConfig = require("../models/CarRaceRewardConfig");
const Decimal = require("decimal.js");
const CarRaceEntryFeeConfig = require("../models/CarRaceEntryFeeConfig");
const UserBalance = require("../models/UserBalance");
const UserCarCustomization = require("../models/UserCarCustomization");
const UserRaceWinCounter = require("../models/UserRaceWinCounter");
const RaceWinRewardConfig = require("../models/RaceWinRewardConfig");


// === Constants untuk reset default ===
const statParts = ["engine", "brake", "handling", "speed"];
const visualParts = [
  "spoiler",
  "wheel",
  "siren",
  "neonIndex",
  "decalIndexFront",
  "decalIndexBack",
  "decalIndexLeft",
  "decalIndexRight"
];

// ⏳ Forfeit race sebelumnya jika belum selesai
const forfeitPreviousRaceIfAny = async (userId) => {
  const pending = await UserRaceResult.findOne({
    where: { userId, status: "pending" }
  });

  if (pending) {
    console.warn(`⚠️ Forfeiting previous race. User: ${userId}, Asset: ${pending.assetId}`);
    pending.status = "forfeit";
    await pending.save();
  }
};

exports.startRaceSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assetId, trackName, mode, totalPlayers, totalBots } = req.body;

    if (!assetId || !mode) {
      return res.status(400).json({ error: "Data tidak lengkap." });
    }

    // 1. **⛔ Entry fee hanya jika mode !== practice**
    if (mode && mode.toLowerCase() !== "practice") {
      const entryFee = await CarRaceEntryFeeConfig.findOne({ where: { assetId } });
      if (entryFee && entryFee.feeAmount && entryFee.feeCurrency) {
        const userBalance = await UserBalance.findOne({ where: { userId } });
        if (!userBalance) return res.status(400).json({ error: "Saldo user tidak ditemukan." });

        const feeAmount = new Decimal(entryFee.feeAmount);
        const currency = entryFee.feeCurrency;

        const userTokenBalance = userBalance[currency.toLowerCase()] || new Decimal(0);
        if (userTokenBalance.lt(feeAmount)) {
          return res.status(400).json({
            error: `Saldo ${currency} tidak cukup. Butuh ${feeAmount} ${currency}.`,
          });
        }

        userBalance[currency.toLowerCase()] = userTokenBalance.minus(feeAmount).toFixed();
        await userBalance.save();
        console.log(`💸 ${feeAmount} ${currency} dipotong dari user ${userId} untuk asset ${assetId}`);
      }
    }

    await forfeitPreviousRaceIfAny(userId);

    const session = await RaceSession.create({
      trackName: trackName || "Unknown",
      mode,
      totalPlayers: totalPlayers || 1,
      totalBots: totalBots || 0,
    });

    await UserRaceResult.create({
      userId,
      assetId,
      position: -1,
      time: -1,
      earnedPoints: 0,
      raceSessionId: session.id,
      status: "pending",
    });

    console.log("🚦 User started race session:", userId);
    return res.json({ message: "Race session started", sessionId: session.id });

  } catch (err) {
    console.error("❌ Gagal start race:", err);
    return res.status(500).json({ error: "Gagal memulai sesi race." });
  }
};



// 🔍 Helper: cari part dengan fallback pintar
const findPart = async (userId, assetId, partType, value) => {
  const stringValue = String(value).toUpperCase();

  const exact = await UserOwnedCustomizationParts.findOne({
    where: { userId, assetId, partType, value: stringValue },
  });

  if (exact) return exact;

  console.warn(`🔎 Tidak menemukan exact match untuk ${partType}:${stringValue}. Mencoba fallback.`);

  // 🧠 Fallback: ambil partType dengan durability tertinggi
  const fallback = await UserOwnedCustomizationParts.findOne({
    where: { userId, assetId, partType },
    order: [["durability", "DESC"], ["value", "DESC"]],
  });

  if (fallback) {
    console.warn(`✅ Menggunakan fallback part: ${fallback.partType}:${fallback.value}`);
    return fallback;
  }

  return null;
};


// === Helper reset part stat/visual ke default jika durability habis ===
async function resetCustomizationFieldIfNeeded(userId, assetId, partType) {
  const updateFields = {};

  // Reset part stat (upgrade level + price)
  if (statParts.includes(partType)) {
    const fieldName = partType + "Level";
    const priceField = partType + "Price";
    updateFields[fieldName] = 0;
    updateFields[priceField] = 0;
  }

  // Reset part visual
  if (visualParts.includes(partType)) {
    updateFields[partType] = -1;
  }

  // Reset khusus warna
  if (partType === "paint") updateFields.paint = "#000000";
  if (partType === "headlightColor") updateFields.headlightColor = "#FFFFFF";
  if (partType === "wheelSmokeColor") updateFields.wheelSmokeColor = "#FFFFFF";

  // Update hanya jika ada perubahan
  if (Object.keys(updateFields).length > 0) {
    await UserCarCustomization.update(updateFields, { where: { userId, assetId } });
    console.log(`🗑️ Part ${partType} durability habis, field direset:`, updateFields);
  }
}

exports.submitRaceResult = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assetId, position, time, partsUsed } = req.body;

    if (!assetId || typeof position !== "number" || typeof time !== "number") {
      return res.status(400).json({ error: "Data tidak lengkap atau invalid." });
    }

    console.log("📥 Submit Race Result:", { userId, assetId, position, time });

    const raceResult = await UserRaceResult.findOne({
      where: { userId, assetId, status: "pending" },
      include: [{ model: RaceSession, as: "RaceSession" }],
    });

    if (!raceResult) return res.status(400).json({ error: "Race belum dimulai atau sudah dikirim." });

    const raceSession = raceResult.RaceSession;
    if (!raceSession) return res.status(500).json({ error: "RaceSession tidak ditemukan." });

    const car = await UserInventoryRace.findOne({ where: { userId, assetId } });
    if (!car) return res.status(400).json({ error: "Mobil tidak ditemukan." });

    // 🎯 Hitung poin dari posisi
    let earnedPoints = 0;
    if (position === 1) earnedPoints = 5;
    else if (position === 2) earnedPoints = 3;
    else if (position === 3) earnedPoints = 2;

    // 💾 Update hasil race
    raceResult.position = position;
    raceResult.time = time;
    raceResult.earnedPoints = earnedPoints;
    raceResult.status = "done";
    await raceResult.save();

    // ==============================
    //  Counter logic (N race/menang) HANYA NON-PRACTICE
    // ==============================
    let rewardGranted = false;
    let bonusAmount = "0";
    let cycleNumber = 1, raceCountNow = 0, winCountNow = 0, N = 0;

    if (raceSession.mode && raceSession.mode.toLowerCase() !== "practice") {
      // Ambil N dari config (RaceWinRewardConfig)
      const configN = await RaceWinRewardConfig.findOne({ order: [["createdAt", "DESC"]] });
      const maxN = configN?.winCount || 5;

      // Ambil counter aktif (yang belum penuh)
      let counter = await UserRaceWinCounter.findOne({
        where: {
          userId,
          assetId,
          raceCount: { [require("sequelize").Op.lt]: maxN }
        },
        order: [["cycleNumber", "DESC"]],
      });

      if (!counter) {
        // Belum ada cycle aktif, buat baru
        counter = await UserRaceWinCounter.create({
          userId,
          assetId,
          raceCount: 1,
          winCount: position === 1 ? 1 : 0,
          cycleNumber: 1,
          maxRaceCount: maxN,
        });
      } else {
        counter.raceCount += 1;
        if (position === 1) counter.winCount += 1;
        await counter.save();
      }

      N = counter.maxRaceCount;
      raceCountNow = counter.raceCount;
      winCountNow = counter.winCount;
      cycleNumber = counter.cycleNumber;

      // Jika sudah N balapan, evaluasi reward lalu buat record baru
      if (counter.raceCount >= N) {
        if (counter.winCount > 0) {
          const rewardConfig = await CarRaceRewardConfig.findOne({ where: { assetId } });
          const bonus = rewardConfig?.winSbp || new Decimal(0);
          if (bonus.gt(0)) {
            await grantSbpWithSource(userId, bonus, `win_asset_${assetId}`, "race_reward");
            rewardGranted = true;
            bonusAmount = bonus.toString();
          }
        }

        // **Insert cycle baru, bukan reset!**
        const nextCycle = counter.cycleNumber + 1;
        await UserRaceWinCounter.create({
          userId,
          assetId,
          raceCount: 0,
          winCount: 0,
          cycleNumber: nextCycle,
          maxRaceCount: maxN,
        });

        raceCountNow = 0;
        winCountNow = 0;
        cycleNumber = nextCycle;
      }
    }

    // ==============================
    // Durability logic
    // ==============================
    let updatedDurabilities = [];

    // ---- HANYA PROSES JIKA BUKAN PRACTICE ----
    if (raceSession.mode && raceSession.mode.toLowerCase() !== "practice") {
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
    } else {
      // Practice: Tidak ada durability yang dikurangi
      updatedDurabilities = [];
    }

    console.log("✅ Race result updated. Points:", earnedPoints, "Mode:", raceSession.mode);

    return res.json({
      message: "Hasil race disimpan.",
      earnedPoints,
      sessionId: raceResult.raceSessionId,
      updatedDurabilities,
      rewardGranted,
      raceCount: raceCountNow,
      winCount: winCountNow,
      cycleNumber,
      N,
      bonus: bonusAmount,
    });

  } catch (err) {
    console.error("❌ Gagal menyimpan hasil race:", err);
    return res.status(500).json({ error: "Gagal menyimpan hasil race." });
  }
};



exports.getUserRaceWinCounter = async (req, res) => {
  try {
    const userId = req.user.id;
    const assetId = parseInt(req.query.assetId);

    if (!assetId || isNaN(assetId)) {
      return res.status(400).json({ error: "assetId tidak valid." });
    }

    // Ambil N (maxRaceCount) dari config terbaru, default 5
    let maxRaceCount = 5;
    const winRewardConfig = await RaceWinRewardConfig.findOne({ order: [["createdAt", "DESC"]] });
    if (winRewardConfig?.winCount) maxRaceCount = winRewardConfig.winCount;

    // Ambil progress di cycle terbaru
    const counter = await UserRaceWinCounter.findOne({
      where: { userId, assetId },
      order: [
        ['cycleNumber', 'DESC'], // Pastikan cycle terbaru
        ['createdAt', 'DESC'],   // Kalau cycleNumber sama, ambil yang terbaru
      ],
    });

    // Jika belum pernah balap sama sekali, kirim default progress
    if (!counter) {
      return res.json({
        raceCount: 0,
        winCount: 0,
        cycleNumber: 1,
        maxRaceCount,
      });
    }

    // Ada counter, tampilkan cycle terbaru
    return res.json({
      raceCount: counter.raceCount || 0,
      winCount: counter.winCount || 0,
      cycleNumber: counter.cycleNumber || 1,
      maxRaceCount: counter.maxRaceCount || maxRaceCount,
    });

  } catch (err) {
    console.error("❌ Gagal ambil win counter:", err);
    return res.status(500).json({ error: "Gagal mengambil win counter." });
  }
};


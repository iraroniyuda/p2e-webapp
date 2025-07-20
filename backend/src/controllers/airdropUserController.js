const AirdropSchedule = require("../models/AirdropSchedule");
const AirdropParticipant = require("../models/AirdropParticipant");
const { Op } = require("sequelize");
const Decimal = require("decimal.js");

// 🔧 Optional helper untuk serialize field Decimal
function serializeDecimalFields(obj, fields = []) {
  for (const field of fields) {
    if (obj[field] instanceof Decimal) {
      obj[field] = obj[field].toString();
    }
  }
  return obj;
}

// GET /airdrop/active
exports.listActiveAirdrops = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const schedules = await AirdropSchedule.findAll({
      where: {
        isClosed: false,
        deadline: { [Op.gt]: now },
      },
      order: [["deadline", "ASC"]],
    });

    const enriched = await Promise.all(
      schedules.map(async (s) => {
        const participation = await AirdropParticipant.findOne({
          where: { userId, scheduleId: s.id },
        });

        // 💡 Serialize Decimal field
        const data = s.toJSON();
        serializeDecimalFields(data, ["amountPerUser"]);

        return {
          ...data,
          participationStatus: participation?.status || null,
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    console.error("❌ Failed to fetch active airdrops:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /airdrop/:id/join
exports.joinAirdrop = async (req, res) => {
  try {
    const userId = req.user.id;
    const scheduleId = req.params.id;

    const existing = await AirdropParticipant.findOne({ where: { userId, scheduleId } });
    if (existing) return res.status(400).json({ message: "Sudah terdaftar." });

    await AirdropParticipant.create({ userId, scheduleId, status: "PENDING" });

    res.json({ message: "✅ Berhasil daftar airdrop." });
  } catch (err) {
    console.error("❌ Failed to join airdrop:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

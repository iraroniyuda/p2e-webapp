const CarRaceRewardConfig = require("../models/CarRaceRewardConfig");
const GameAssetStoreRace = require("../models/GameAssetStoreRace");
const Decimal = require("decimal.js");

// 🔍 Get semua reward config + nama mobil dari GameAssetStoreRaces
exports.getAllCarRaceRewards = async (req, res) => {
  try {
    const data = await CarRaceRewardConfig.findAll({
      include: [{
        model: GameAssetStoreRace,
        as: "carAsset",
        attributes: ["name"]
      }],
      order: [["assetId", "ASC"]]
    });

    const result = data.map(item => ({
      assetId: item.assetId,
      carName: item.carAsset?.name || "Unknown",
      winSbp: item.winSbp.toString()
    }));

    return res.json(result);
  } catch (err) {
    console.error("❌ Gagal getAllCarRaceRewards:", err);
    return res.status(500).json({ error: "Gagal mengambil data reward." });
  }
};

// ✏️ Upsert / Edit reward SBP per assetId
exports.updateCarRaceReward = async (req, res) => {
  try {
    const { assetId, winSbp } = req.body;

    if (!assetId || winSbp == null) {
      return res.status(400).json({ error: "AssetId dan winSbp wajib diisi." });
    }

    const [config, created] = await CarRaceRewardConfig.upsert({
      assetId,
      winSbp: new Decimal(winSbp),
    });

    return res.json({
      message: created ? "Reward ditambahkan." : "Reward diperbarui.",
      data: {
        assetId,
        winSbp: winSbp.toString()
      }
    });

  } catch (err) {
    console.error("❌ Gagal updateCarRaceReward:", err);
    return res.status(500).json({ error: "Gagal menyimpan data reward." });
  }
};

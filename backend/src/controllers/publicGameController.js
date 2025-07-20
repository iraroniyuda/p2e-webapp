const CarRaceRewardConfig = require("../models/CarRaceRewardConfig");
const CarRaceEntryFeeConfig = require("../models/CarRaceEntryFeeConfig");
const GameAssetStoreRace = require("../models/GameAssetStoreRace");


// 📤 Public: Ambil semua konfigurasi reward balapan per mobil
exports.getPublicCarRaceRewardConfigs = async (req, res) => {
  try {
    const entries = await CarRaceRewardConfig.findAll({
      include: {
        model: GameAssetStoreRace,
        as: "carAsset",
        attributes: ["id", "name", "prefabName"],
      },
    });

    res.json(entries);
  } catch (err) {
    console.error("❌ Gagal ambil reward config:", err);
    res.status(500).json({ error: "Gagal mengambil data." });
  }
};


// 📤 Public: Ambil semua konfigurasi entry fee balapan per mobil
exports.getPublicCarRaceEntryFees = async (req, res) => {
  try {
    const entries = await CarRaceEntryFeeConfig.findAll({
      include: {
        model: GameAssetStoreRace,
        as: "carAsset",
        attributes: ["id", "name", "prefabName"],
      },
    });

    res.json(entries);
  } catch (err) {
    console.error("❌ Gagal ambil entry fee:", err);
    res.status(500).json({ error: "Gagal mengambil data." });
  }
};

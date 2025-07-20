const CarRaceEntryFeeConfig = require("../models/CarRaceEntryFeeConfig");
const GameAssetStoreRace = require("../models/GameAssetStoreRace");

// GET all configs
exports.getAllEntryFeeConfigs = async (req, res) => {
  try {
    const configs = await CarRaceEntryFeeConfig.findAll({
      include: {
        model: GameAssetStoreRace,
        as: "carAsset",
        attributes: ["id", "name", "prefabName"],
      },
    });
    res.json(configs);
  } catch (err) {
    console.error("❌ Gagal ambil Entry Fee Configs:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET one by assetId
exports.getEntryFeeByAssetId = async (req, res) => {
  try {
    const { assetId } = req.params;
    const config = await CarRaceEntryFeeConfig.findByPk(assetId);
    if (!config) return res.status(404).json({ message: "Config not found" });
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST create/update config
exports.setEntryFee = async (req, res) => {
  try {
    const { assetId, feeAmount, feeCurrency } = req.body;

    if (!assetId || !feeCurrency) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const [config, created] = await CarRaceEntryFeeConfig.upsert({
      assetId,
      feeAmount,
      feeCurrency,
    });

    res.json({ message: created ? "Config created" : "Config updated", config });
  } catch (err) {
    console.error("❌ Gagal simpan Entry Fee:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

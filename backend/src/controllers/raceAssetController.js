const GameAssetStoreRace = require("../models/GameAssetStoreRace");

const getAllAssets = async (req, res) => {
  try {
    const assets = await GameAssetStoreRace.findAll({
      where: { isActive: true, type: "car" },
      order: [["id", "ASC"]],
    });

    res.json(assets);
  } catch (err) {
    console.error("❌ Failed to fetch assets", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllAssets,
};

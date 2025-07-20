// apps/backend-api/src/controllers/versionController.js
const GameVersionConfigRace = require("../models/GameVersionConfigRace");

exports.checkVersion = async (req, res) => {
  try {
    const config = await GameVersionConfigRace.findOne({ order: [["createdAt", "DESC"]] });
    if (!config) {
      return res.status(404).json({ message: "Race version config not found" });
    }

    res.json({
      status: "OK",
      minVersion: config.minVersion,
      latestVersion: config.latestVersion,
      forceUpdate: config.forceUpdate,
      message: config.message,
    });
  } catch (error) {
    console.error("❌ Error in checkVersion:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

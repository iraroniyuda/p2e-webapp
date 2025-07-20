const UserInventoryRace = require("../models/UserInventoryRace");
const GameAssetStoreRace = require("../models/GameAssetStoreRace");
const Decimal = require("decimal.js");

// optional helper
function serializeDecimalFields(obj, fields = []) {
  for (const field of fields) {
    if (obj[field] instanceof Decimal) {
      obj[field] = obj[field].toString();
    }
  }
  return obj;
}

const getUserInventory = async (req, res) => {
  try {
    const userId = req.user.id;

    const inventory = await UserInventoryRace.findAll({
      where: { userId },
      include: [
        {
          model: GameAssetStoreRace,
          as: "asset",
          attributes: ["id", "name", "prefabName", "price"]
        }
      ],
    });

    const output = inventory.map((inv) => {
      const data = inv.toJSON();
      if (data.asset) {
        serializeDecimalFields(data.asset, ["price"]);
      }
      return data;
    });

    const ownedCarAssetIds = output
      .filter(item => item.asset?.type === "car" || item.assetType === "car")
      .map(item => item.assetId);

    res.json({
      success: true,
      ownedCarAssetIds, // ✅ inilah yang dibutuhkan Unity
      fullInventory: output, // optional jika ingin dipakai juga
    });

  } catch (error) {
    console.error("❌ Error fetching inventory:", error);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
};

module.exports = {
  getUserInventory,
};

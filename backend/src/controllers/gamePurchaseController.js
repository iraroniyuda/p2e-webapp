const Decimal = require("decimal.js");
const { Op } = require("sequelize");

const User = require("../models/User");
const UserBalance = require("../models/UserBalance");
const UserInventoryRace = require("../models/UserInventoryRace");
const GameAssetStoreRace = require("../models/GameAssetStoreRace");
const UserPurchaseHistoryRace = require("../models/UserPurchaseHistoryRace");
const UserCarCustomization = require("../models/UserCarCustomization");
const UserCarUpgradeHistory = require("../models/UserCarUpgradeHistory");
const UserOwnedCustomizationParts = require("../models/UserOwnedCustomizationParts");
const applyReferralBonusFromRaceStore = require("../utils/applyReferralBonusFromRaceStore");
const UpgradeFlatPriceConfig = require("../models/UpgradeFlatPriceConfig");

const DEFAULT_CUSTOMIZATION = {
  engineLevel: 0,
  brakeLevel: 0,
  handlingLevel: 0,
  speedLevel: 0,
  spoiler: -1,
  siren: -1,
  wheel: -1,
  neonIndex: -1,
  decalIndexFront: -1,
  decalIndexBack: -1,
  decalIndexLeft: -1,
  decalIndexRight: -1,
  paint: "#FFFFFF",
  headlightColor: "#FFFFFF",
  wheelSmokeColor: "#FFFFFF",
  cambersFront: 0,
  cambersRear: 0,
  suspensionDistanceFront: 0,
  suspensionDistanceRear: 0,
};

exports.purchaseCar = async (req, res) => {
  try {
    const userId = req.user.id;
    const assetId = parseInt(req.body.assetId);

    if (!Number.isInteger(assetId) || assetId <= 0)
      return res.status(400).json({ error: "assetId harus berupa angka bulat positif." });

    const asset = await GameAssetStoreRace.findByPk(assetId);
    if (!asset || asset.type !== "car")
      return res.status(404).json({ error: "Mobil tidak ditemukan atau bukan tipe 'car'." });

    const price = new Decimal(asset.price || 0);
    const balance = await UserBalance.findOne({ where: { userId } });

    if (!balance || new Decimal(balance.race).lt(price))
      return res.status(400).json({ error: "Saldo tidak cukup atau tidak ditemukan." });

    await balance.decrement("race", { by: price.toFixed() });

    await UserInventoryRace.create({ userId, assetType: "car", assetId, price: price.toFixed() });
    await UserPurchaseHistoryRace.create({ userId, assetId, assetType: "car", price: price.toFixed(), bonusGiven: false });

    const customizationRestored = await restoreCustomizationIfNeeded(userId, assetId);

    const user = await User.findByPk(userId);
    await applyReferralBonusFromRaceStore(user, asset);

    console.log(`✅ User ${userId} beli mobil ID ${assetId} seharga ${price.toFixed()}`);
    res.json({ success: true, message: "Mobil berhasil dibeli.", restored: customizationRestored });
  } catch (err) {
    console.error("❌ Error beli mobil:", err);
    res.status(500).json({ error: "Terjadi kesalahan di server." });
  }
};

async function restoreCustomizationIfNeeded(userId, assetId) {
  const existing = await UserCarCustomization.findOne({ where: { userId, assetId } });
  if (existing) {
    console.log(`♻️ Data upgrade sudah ada untuk mobil ${assetId}, tidak perlu sinkronisasi.`);
    return true;
  }

  const parts = ["engine", "brake", "handling", "speed"];
  const levelMap = {};

  for (const part of parts) {
    const last = await UserCarUpgradeHistory.findOne({
      where: { userId, assetId, partType: part },
      order: [["newLevel", "DESC"]],
    });
    if (last) levelMap[`${part}Level`] = last.newLevel;
  }

  if (Object.keys(levelMap).length > 0) {
    await UserCarCustomization.upsert({ userId, assetId, ...DEFAULT_CUSTOMIZATION, ...levelMap });
    console.log(`♻️ Sinkronisasi level upgrade mobil ${assetId} dari history.`);
    return true;
  }

  console.log(`🆕 Tidak ada history upgrade untuk mobil ${assetId}.`);
  return false;
}

exports.purchaseCustomizationPart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assetId, partType, value } = req.body;

    if (!assetId || !partType || value === undefined) {
      return res.status(400).json({ error: "❌ Parameter tidak lengkap." });
    }

    let config = await UpgradeFlatPriceConfig.findOne({ where: { partType } });

    if (!config && partType.startsWith("decal_")) {
      config = await UpgradeFlatPriceConfig.findOne({ where: { partType: "decal" } });
    }

    if (!config) {
      return res.status(400).json({ error: `❌ Konfigurasi part '${partType}' tidak ditemukan.` });
    }

    const price = config.price;
    const valueSBP = config.valueSBP;
    const defaultDurability = config.defaultDurability ?? 100;

    const balance = await UserBalance.findOne({ where: { userId } });
    if (!balance || new Decimal(balance.race).lt(price)) {
      return res.status(400).json({ error: "❌ Saldo tidak cukup." });
    }

    const priceField = `${partType}Price`;
    const existing = await UserCarCustomization.findOne({ where: { userId, assetId } });

    if (!existing) {
      await UserCarCustomization.create({
        userId,
        assetId,
        ...DEFAULT_CUSTOMIZATION,
        [partType]: value,
        [priceField]: price,
      });
    } else {
      existing[partType] = value;
      existing[priceField] = price;
      await existing.save();
    }

    // 🔁 Beli part: cek apakah sudah pernah punya
    const [ownedPart, created] = await UserOwnedCustomizationParts.findOrCreate({
      where: {
        userId,
        assetId,
        partType,
        value: String(value).toUpperCase(),
      },
      defaults: {
        durability: defaultDurability,
      },
    });

    if (!created) {
      if (ownedPart.durability > 0) {
        return res.status(400).json({ error: "❌ Kamu sudah memiliki part ini." });
      }

      // Jika durability 0 → reset
      ownedPart.durability = defaultDurability;
      await ownedPart.save();
    }

    // 💸 Potong saldo
    await balance.decrement("race", { by: price.toFixed() });

    // 💰 Referral bonus (gunakan config.valueSBP)
    const user = await User.findByPk(userId);
    const assetForBonus = {
      id: assetId,
      type: "customization",
      valueSBP,
    };
    await applyReferralBonusFromRaceStore(user, assetForBonus);

    console.log(`🛠️ User ${userId} membeli part ${partType}:${value} dengan durability ${defaultDurability}`);
    return res.json({ success: true });
  } catch (err) {
    console.error("❌ Gagal beli part kustomisasi:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};



exports.getUnlockedCustomizationParts = async (req, res) => {
  try {
    const userId = req.user.id;
    const assetId = parseInt(req.params.assetId);

    if (!Number.isInteger(assetId) || assetId <= 0) {
      return res.status(400).json({ error: "❌ assetId tidak valid" });
    }

    const owned = await UserOwnedCustomizationParts.findAll({
      where: { userId, assetId },
    });

    const result = owned.map(item => `${item.partType}_${item.value.toUpperCase()}`);
    return res.json({ unlocked: result });
  } catch (err) {
    console.error("❌ Gagal ambil owned parts:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


exports.getCustomization = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assetId } = req.params;

    // 🔍 Ambil data utama
    const c = await UserCarCustomization.findOne({ where: { userId, assetId } });
    if (!c) {
      return res.json({
        spoiler: -1,
        siren: -1,
        wheel: -1,
        neonIndex: -1,
        decalIndexFront: -1,
        paint: "#FFFFFF",
      });
    }

    // 🧰 Utility: Normalisasi warna hex (#AARRGGBB → #RRGGBB)
    const normalizeHex = (hex) => {
      if (!hex) return "#FFFFFF";
      hex = hex.trim().toUpperCase();
      if (!hex.startsWith("#")) hex = "#" + hex;
      if (hex.length === 9) return "#" + hex.substring(3); // #AARRGGBB → #RRGGBB
      if (hex.length === 7) return hex;
      return "#FFFFFF";
    };

    // 🔩 Ambil semua parts milik user
    const ownedParts = await UserOwnedCustomizationParts.findAll({
      where: { userId, assetId },
    });

    // 🎨 Override paint jika user pernah pakai paint yang lebih baru
    const lastUsedPaint = ownedParts
      .filter((p) => p.partType === "paint")
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];

    if (lastUsedPaint) {
      const cleanPaint = normalizeHex(lastUsedPaint.value);
      if (cleanPaint !== c.paint) {
        console.log(`🎨 Override paint dari ${c.paint} → ${cleanPaint}`);
        c.paint = cleanPaint;
      }
    }

    // 🛡️ Ambil durability part
    const getDurability = (partType, value) => {
      const entry = ownedParts.find(
        (p) => p.partType === partType && p.value.toUpperCase() === String(value).toUpperCase()
      );
      return entry?.durability || 0;
    };

    // 🔧 Helper part resolve
    const resolvePart = (value, price, defaultValue) => ({
      value,
      price: price > 0 ? price : 0,
      displayValue: value !== undefined ? value : defaultValue,
    });

    // ✅ Kirim hasil final ke client
    return res.json({
      assetId: c.assetId,
      engineLevel: c.engineLevel,
      brakeLevel: c.brakeLevel,
      handlingLevel: c.handlingLevel,
      speedLevel: c.speedLevel,
      cambersFront: c.cambersFront,
      cambersRear: c.cambersRear,
      suspensionDistanceFront: c.suspensionDistanceFront,
      suspensionDistanceRear: c.suspensionDistanceRear,

      paint: resolvePart(c.paint, c.paintPrice, "#FFFFFF").displayValue,
      paintPrice: resolvePart(c.paint, c.paintPrice).price,
      paintDurability: getDurability("paint", c.paint),

      wheel: resolvePart(c.wheel, c.wheelPrice, -1).displayValue,
      wheelPrice: resolvePart(c.wheel, c.wheelPrice).price,
      wheelDurability: getDurability("wheel", c.wheel),

      siren: resolvePart(c.siren, c.sirenPrice, -1).displayValue,
      sirenPrice: resolvePart(c.siren, c.sirenPrice).price,
      sirenDurability: getDurability("siren", c.siren),

      spoiler: resolvePart(c.spoiler, c.spoilerPrice, -1).displayValue,
      spoilerPrice: resolvePart(c.spoiler, c.spoilerPrice).price,
      spoilerDurability: getDurability("spoiler", c.spoiler),

      neonIndex: resolvePart(c.neonIndex, c.neonPrice, -1).displayValue,
      neonPrice: resolvePart(c.neonIndex, c.neonPrice).price,
      neonIndexDurability: getDurability("neon", c.neonIndex),

      decalIndexFront: resolvePart(c.decalIndexFront, c.decalPrice, -1).displayValue,
      decalIndexBack: resolvePart(c.decalIndexBack, c.decalPrice, -1).displayValue,
      decalIndexLeft: resolvePart(c.decalIndexLeft, c.decalPrice, -1).displayValue,
      decalIndexRight: resolvePart(c.decalIndexRight, c.decalPrice, -1).displayValue,
      decalPrice: resolvePart(c.decalIndexFront, c.decalPrice).price,

      decalFrontDurability: getDurability("decalIndexFront", c.decalIndexFront),
      decalBackDurability: getDurability("decalIndexBack", c.decalIndexBack),
      decalLeftDurability: getDurability("decalIndexLeft", c.decalIndexLeft),
      decalRightDurability: getDurability("decalIndexRight", c.decalIndexRight),

      headlightColor: resolvePart(c.headlightColor, c.headlightPrice, "#FFFFFF").displayValue,
      headlightPrice: resolvePart(c.headlightColor, c.headlightPrice).price,
      headlightColorDurability: getDurability("headlightColor", c.headlightColor),

      wheelSmokeColor: resolvePart(c.wheelSmokeColor, c.wheelSmokePrice, "#FFFFFF").displayValue,
      wheelSmokePrice: resolvePart(c.wheelSmokeColor, c.wheelSmokePrice).price,
      wheelSmokeColorDurability: getDurability("wheelSmokeColor", c.wheelSmokeColor),
    });

  } catch (err) {
    console.error("❌ Gagal ambil kustomisasi:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};



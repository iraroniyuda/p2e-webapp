const Decimal = require("decimal.js");
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const User = require("../models/User");
const UserBalance = require("../models/UserBalance");
const UserInventoryRace = require("../models/UserInventoryRace");
const GameAssetStoreRace = require("../models/GameAssetStoreRace");
const UserPurchaseHistoryRace = require("../models/UserPurchaseHistoryRace");
const UserCarCustomization = require("../models/UserCarCustomization");
const UserOwnedCustomizationParts = require("../models/UserOwnedCustomizationParts");
const UpgradeFlatPriceConfig = require("../models/UpgradeFlatPriceConfig");
const applyReferralBonusFromRaceStore = require("../utils/applyReferralBonusFromRaceStore");
const UserCarUpgradeHistory = require("../models/UserCarUpgradeHistory");
const UserAllPurchasedCustomizationParts = require("../models/UserAllPurchasedCustomizationParts");

const { Transaction } = require('sequelize');


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
  paint: "#000000",
  headlightColor: "#FFFFFF",
  wheelSmokeColor: "#FFFFFF",
  cambersFront: 0,
  cambersRear: 0,
  suspensionDistanceFront: 0,
  suspensionDistanceRear: 0,
};

const colorToHex = (c) => {
  // Jika sudah string hex dan valid, kembalikan langsung
  if (typeof c === "string" && /^#[0-9A-Fa-f]{6}$/.test(c)) {
    return c.toUpperCase();
  }

  // Jika objek dengan RGB valid
  if (
    typeof c === "object" &&
    c != null &&
    typeof c.r === "number" &&
    typeof c.g === "number" &&
    typeof c.b === "number"
  ) {
    const r = Math.round(Math.max(0, Math.min(1, c.r)) * 255)
      .toString(16)
      .padStart(2, "0");
    const g = Math.round(Math.max(0, Math.min(1, c.g)) * 255)
      .toString(16)
      .padStart(2, "0");
    const b = Math.round(Math.max(0, Math.min(1, c.b)) * 255)
      .toString(16)
      .padStart(2, "0");
    return `#${r}${g}${b}`.toUpperCase();
  }

  // Default fallback
  return "#000000";
};




const getCustomization = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assetId } = req.params;

    // Auto-create customization jika belum ada
    let c = await UserCarCustomization.findOne({ where: { userId, assetId } });
    if (!c) {
      c = await UserCarCustomization.create({
        userId,
        assetId,
        ...DEFAULT_CUSTOMIZATION,
      });
    }

    const ownedParts = await UserOwnedCustomizationParts.findAll({ where: { userId, assetId } });

    // Fungsi pencari durability
    const getDurability = (type, value) => {
      const match = ownedParts.find(
        (p) => p.partType === type && String(p.value).toUpperCase() === String(value).toUpperCase()
      );
      return match?.durability || 0;
    };

    const resolvePart = (value, price, def) => ({
      value,
      price: price > 0 ? price : 0,
      displayValue: value !== undefined ? value : def,
    });

    // --- PATCH: Reset index ke default jika durability sudah 0 (tidak ngirim index "hantu")
    if (getDurability("neon", c.neonIndex) <= 0) c.neonIndex = -1;
    if (getDurability("decal_front", c.decalIndexFront) <= 0) c.decalIndexFront = -1;
    if (getDurability("decal_back", c.decalIndexBack) <= 0) c.decalIndexBack = -1;
    if (getDurability("decal_left", c.decalIndexLeft) <= 0) c.decalIndexLeft = -1;
    if (getDurability("decal_right", c.decalIndexRight) <= 0) c.decalIndexRight = -1;
    if (getDurability("wheel", c.wheel) <= 0) c.wheel = -1;
    if (getDurability("spoiler", c.spoiler) <= 0) c.spoiler = -1;
    if (getDurability("siren", c.siren) <= 0) c.siren = -1;

    return res.json({
      assetId: c.assetId,

      // Upgrade stat
      engineLevel: c.engineLevel,
      engineDurability: getDurability("engine", c.engineLevel),

      brakeLevel: c.brakeLevel,
      brakeDurability: getDurability("brake", c.brakeLevel),

      handlingLevel: c.handlingLevel,
      handlingDurability: getDurability("handling", c.handlingLevel),

      speedLevel: c.speedLevel,
      speedDurability: getDurability("speed", c.speedLevel),

      cambersFront: c.cambersFront,
      cambersRear: c.cambersRear,
      suspensionDistanceFront: c.suspensionDistanceFront,
      suspensionDistanceRear: c.suspensionDistanceRear,

      paint: resolvePart(c.paint, c.paintPrice, "#000000").displayValue,
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


      decalFrontDurability: getDurability("decal_front", c.decalIndexFront),
      decalBackDurability: getDurability("decal_back", c.decalIndexBack),
      decalLeftDurability: getDurability("decal_left", c.decalIndexLeft),
      decalRightDurability: getDurability("decal_right", c.decalIndexRight),

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



const purchaseCar = async (req, res) => {
  try {
    const userId = req.user.id;
    const assetId = +req.body.assetId;

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
    await UserPurchaseHistoryRace.create({
      userId,
      assetId,
      assetType: "car",
      price: price.toFixed(),
      bonusGiven: false,
    });

    // Reset customization
    await UserCarCustomization.destroy({ where: { userId, assetId } });
    await UserOwnedCustomizationParts.destroy({ where: { userId, assetId } });

    await UserCarCustomization.create({
      userId,
      assetId,
      ...DEFAULT_CUSTOMIZATION,
    });

    const user = await User.findByPk(userId);
    await applyReferralBonusFromRaceStore(user, asset);

    res.json({ success: true, message: "Mobil berhasil dibeli." });
  } catch (err) {
    console.error("❌ Error beli mobil:", err);
    res.status(500).json({ error: "Terjadi kesalahan di server." });
  }
};


const restoreCustomizationIfNeeded = async (userId, assetId) => {
  const existing = await UserCarCustomization.findOne({ where: { userId, assetId } });
  if (existing) {
    console.log(`♻️ Data upgrade sudah ada untuk mobil ${assetId}, tidak perlu sinkronisasi.`);
    return true;
  }

  await UserCarCustomization.create({
    userId,
    assetId,
    ...DEFAULT_CUSTOMIZATION,
  });

  console.log(`🆕 Customization kosong, data default dibuat untuk mobil ${assetId}.`);
  return true;
};


const purchaseCustomizationPart = async (req, res) => {
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

    const price = new Decimal(config.price);
    const valueSBP = config.valueSBP;
    const defaultDurability = config.defaultDurability ?? 100;

    const balance = await UserBalance.findOne({ where: { userId } });
    if (!balance || new Decimal(balance.race).lt(price)) {
      return res.status(400).json({ error: "❌ Saldo tidak cukup." });
    }

    const priceField = `${partType}Price`;
    let customization = await UserCarCustomization.findOne({ where: { userId, assetId } });
    if (!customization) {
      customization = await UserCarCustomization.create({
        userId,
        assetId,
        ...DEFAULT_CUSTOMIZATION,
      });
    }
    
    // Selalu update field yang diinginkan
    customization[partType] = value;
    customization[priceField] = price.toFixed();  // Ensure price is always stored as Decimal
    await customization.save();

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

      ownedPart.durability = defaultDurability;
      await ownedPart.save();
    }

    await balance.decrement("race", { by: price.toFixed() });  // Decrease balance using Decimal

    const user = await User.findByPk(userId);
    const assetForBonus = {
      id: assetId,
      type: "customization",
      valueSBP,
    };
    await applyReferralBonusFromRaceStore(user, assetForBonus);

    await UserAllPurchasedCustomizationParts.create({
      userId,
      assetId,
      partType,
      value: String(value).toUpperCase(),
      price: price.toFixed(),
      purchasedAt: new Date(),
      source: "purchase"
    });

    console.log(`🛠️ User ${userId} membeli part ${partType}:${value} dengan durability ${defaultDurability}`);
    return res.json({ success: true });
  } catch (err) {
    console.error("❌ Gagal beli part kustomisasi:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


const getUnlockedCustomizationParts = async (req, res) => {
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


const saveCustomization = async (req, res) => {
  try {
    const userId = req.user.id;
    let {
      assetId,
      engineLevel = 0,
      brakeLevel = 0,
      handlingLevel = 0,
      speedLevel = 0,
      spoiler = -1,
      siren = -1,
      wheel = -1,
      neonIndex = -1,
      decalIndexFront = -1,
      decalIndexBack = -1,
      decalIndexLeft = -1,
      decalIndexRight = -1,
      paint = "#000000",
      headlightColor = "#FFFFFF",
      wheelSmokeColor = "#FFFFFF",
      cambersFront = 0,
      cambersRear = 0,
      suspensionDistanceFront = 0,
      suspensionDistanceRear = 0,
    } = req.body;

    if (!assetId || isNaN(assetId)) {
      return res.status(400).json({ error: "❌ assetId tidak valid" });
    }

    // 🎨 Normalize hex
    paint = colorToHex(paint);
    headlightColor = colorToHex(headlightColor);
    wheelSmokeColor = colorToHex(wheelSmokeColor);

    // 💾 Simpan ke UserCarCustomization (overwrite)
    await UserCarCustomization.upsert({
      userId,
      assetId,
      engineLevel,
      brakeLevel,
      handlingLevel,
      speedLevel,
      spoiler,
      siren,
      wheel,
      neonIndex,
      decalIndexFront,
      decalIndexBack,
      decalIndexLeft,
      decalIndexRight,
      paint,
      headlightColor,
      wheelSmokeColor,
      cambersFront,
      cambersRear,
      suspensionDistanceFront,
      suspensionDistanceRear,
    });

    // --- PATCH: TIDAK BOLEH LAGI create/upsert untuk PART UTAMA (engine, brake, handling, speed) DI SINI! ---
    // Durability part stat hanya boleh diubah lewat endpoint upgradeCarPart/purchase, bukan di saveCustomization.

    // --- Boleh tetap: visual/customization parts ---
    const parts = [
      { type: "spoiler", value: spoiler },
      { type: "siren", value: siren },
      { type: "wheel", value: wheel },
      { type: "neonIndex", value: neonIndex },
      { type: "decalIndexFront", value: decalIndexFront },
      { type: "decalIndexBack", value: decalIndexBack },
      { type: "decalIndexLeft", value: decalIndexLeft },
      { type: "decalIndexRight", value: decalIndexRight },
      { type: "paint", value: paint },
      { type: "headlightColor", value: headlightColor },
      { type: "wheelSmokeColor", value: wheelSmokeColor },
    ];

    for (const part of parts) {
      if (part.value === -1 || part.value === "-1") continue;

      const normalizedValue = String(part.value).toUpperCase();

      await UserOwnedCustomizationParts.findOrCreate({
        where: {
          userId,
          assetId,
          partType: part.type,
          value: normalizedValue,
        },
        defaults: {
          durability: (
            await UpgradeFlatPriceConfig.findOne({ where: { partType: part.type } })
          )?.defaultDurability || 100,
        },
      });

      // Optional: kalau mau update durability visual, di sini
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("❌ Gagal simpan data kustomisasi:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


const upgradeCarPart = async (req, res) => {
  const t = await sequelize.transaction({
    isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
  });

  try {
    const userId = req.user.id;
    let { assetId, partType, newLevel } = req.body;

    assetId = +assetId;
    newLevel = +newLevel;
    partType = (partType || "").trim().toLowerCase();

    const allowedParts = ["engine", "brake", "handling", "speed"];
    const partFieldMap = {
      engine: "engineLevel",
      brake: "brakeLevel",
      handling: "handlingLevel",
      speed: "speedLevel",
    };
    const partPriceFieldMap = {
      engine: "enginePrice",
      brake: "brakePrice",
      handling: "handlingPrice",
      speed: "speedPrice",
    };

    if (!assetId || isNaN(newLevel) || !allowedParts.includes(partType)) {
      await t.rollback();
      return res.status(400).json({ error: "❌ assetId, partType, dan newLevel wajib valid." });
    }

    const levelField = partFieldMap[partType];
    const priceField = partPriceFieldMap[partType];

    if (!levelField || !priceField) {
      await t.rollback();
      return res.status(400).json({ error: "❌ partType tidak valid." });
    }

    const config = await UpgradeFlatPriceConfig.findOne({ where: { partType }, transaction: t });
    if (!config) {
      await t.rollback();
      return res.status(400).json({ error: `❌ Harga belum dikonfigurasi untuk part "${partType}"` });
    }

    const price = new Decimal(config.price);
    const priceNumber = price.toNumber();
    const valueSBP = config.valueSBP;
    const defaultDurability = config.defaultDurability || 100;

    const balance = await UserBalance.findOne({ where: { userId }, transaction: t });
    if (!balance || new Decimal(balance.race).lt(price)) {
      await t.rollback();
      return res.status(400).json({ error: "❌ Saldo tidak cukup." });
    }

    let customization = await UserCarCustomization.findOne({
      where: { userId, assetId },
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    let currentLevel = 0;
    if (!customization) {
      // OVERRIDE field di belakang
      const defaultData = {
        userId,
        assetId,
        ...DEFAULT_CUSTOMIZATION,
      };
      defaultData[levelField] = newLevel;
      defaultData[priceField] = priceNumber;
      await UserCarCustomization.create(defaultData, { transaction: t });
      currentLevel = 0;
      // Setelah create, langsung commit dan return, tidak perlu update
      await t.commit();
      return res.json({ success: true, newLevel });
    } else {
      currentLevel = customization[levelField] || 0;

      if (newLevel <= currentLevel) {
        await t.rollback();
        return res.status(400).json({ error: "⚠️ Upgrade sudah dilakukan." });
      }
      if (newLevel !== currentLevel + 1) {
        await t.rollback();
        return res.status(400).json({
          error: `⛔ Upgrade tidak valid. Harus dari Lv.${currentLevel} → Lv.${currentLevel + 1}`,
        });
      }

      const [affectedRows] = await UserCarCustomization.update({
        [levelField]: newLevel,
        [priceField]: priceNumber,
      }, {
        where: { userId, assetId },
        transaction: t,
      });

      if (affectedRows === 0) {
        await t.rollback();
        return res.status(500).json({ error: "❌ Update gagal, data tidak ditemukan." });
      }
    }

    // UserOwnedCustomizationParts (level)
    await UserOwnedCustomizationParts.upsert({
      userId,
      assetId,
      partType,
      value: String(newLevel),
      durability: defaultDurability,
    }, {
      transaction: t,
      conflictFields: ["userId", "assetId", "partType", "value"]
    });


    await UserAllPurchasedCustomizationParts.create({
      userId,
      assetId,
      partType,
      value: String(newLevel),
      price: price.toFixed(),
      purchasedAt: new Date(),
      source: "upgrade"
    }, { transaction: t });


    // Hapus versi selain yang terbaru
    await UserOwnedCustomizationParts.destroy({
      where: {
        userId,
        assetId,
        partType,
        value: { [Op.ne]: String(newLevel) }
      },
      transaction: t
    });

    balance.race = new Decimal(balance.race).minus(price).toFixed();
    await balance.save({ transaction: t });

    if (typeof UserCarUpgradeHistory !== "undefined") {
      await UserCarUpgradeHistory.create({
        userId,
        assetId,
        partType,
        previousLevel: currentLevel,
        newLevel,
        price: price.toFixed(),
        source: "upgrade",
      }, { transaction: t });
    }

    const user = await User.findByPk(userId, { transaction: t });
    await applyReferralBonusFromRaceStore(user, {
      id: assetId,
      type: "upgrade",
      valueSBP,
    });

    await t.commit();
    return res.json({ success: true, newLevel });

  } catch (err) {
    await t.rollback();
    if (
      err?.message?.toLowerCase().includes("could not serialize access") ||
      err?.toString().toLowerCase().includes("could not serialize access")
    ) {
      return res.status(503).json({ error: "⏳ Sedang sibuk, silakan coba lagi dalam beberapa detik." });
    }
    console.error("❌ Gagal upgrade part:", {
      err: err.message,
      stack: err.stack,
      waktu: new Date().toISOString(),
    });
    return res.status(500).json({ error: "Internal server error" });
  }
};



const getOwnedPartLevel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assetId, partType } = req.query;

    if (!assetId || !partType) {
      return res.status(400).json({ error: "assetId dan partType wajib diisi" });
    }

    const record = await UserOwnedCustomizationParts.findOne({
      where: {
        userId,
        assetId,
        partType: partType.trim().toLowerCase()
      },
      order: [["value", "DESC"]]
    });

    const level = record ? parseInt(record.value) : 0;
    return res.json({ level });
  } catch (err) {
    console.error("❌ Gagal ambil owned part level:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getUpgradeLevel = async (req, res) => {
  const userId = req.user.id;
  const { assetId, partType } = req.query;

  if (!assetId || !partType) {
    return res.status(400).json({ error: "❌ assetId dan partType wajib diisi" });
  }

  const normalizedPart = partType.trim().toLowerCase();
  const upgradeParts = ["engine", "brake", "speed", "handling"];

  // Jika part termasuk upgrade stat
  if (upgradeParts.includes(normalizedPart)) {
    const levelField = `${normalizedPart}Level`;

    const customization = await UserCarCustomization.findOne({
      where: { userId, assetId }
    });

    const level = customization?.[levelField] || 0;
    return res.json({ level });
  }

  // Jika part adalah part kosmetik seperti paint, neon, dll
  const ownedBefore = await UserOwnedCustomizationParts.findOne({
    where: {
      userId,
      assetId,
      partType: normalizedPart
    },
    order: [[sequelize.literal('"value"::integer'), 'DESC']]
  });

  const levelFromOwned = parseInt(ownedBefore?.value || "0");
  return res.json({ level: levelFromOwned });
};



const reduceDurabilityBatch = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assetId, partsUsed } = req.body;

    if (!assetId || !Array.isArray(partsUsed)) {
      return res.status(400).json({ error: "❌ assetId dan partsUsed (array) wajib diisi." });
    }

    const updated = [];

    for (const part of partsUsed) {
      const { partType, value } = part;
      if (!partType || !value) continue;

      const entry = await UserOwnedCustomizationParts.findOne({
        where: {
          userId,
          assetId,
          partType,
          value: String(value).toUpperCase(),
        },
      });

      if (entry && entry.durability > 0) {
        entry.durability -= 1;
        await entry.save();
        updated.push({ partType, value, durability: entry.durability });
      }
    }

    return res.json({ success: true, updated });

  } catch (err) {
    console.error("❌ Gagal batch reduce durability:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};



const setSelectedCar = async (req, res) => {
  try {
    const userId = req.user.id;
    const { selectedCarAssetId } = req.body;
    const assetId = parseInt(selectedCarAssetId);


    if (!assetId || isNaN(assetId)) {
      return res.status(400).json({ error: "❌ assetId tidak valid" });
    }


    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "❌ User tidak ditemukan" });

    user.selectedCarAssetId = parseInt(assetId);
    await user.save();

    return res.json({ success: true, selectedCarAssetId: user.selectedCarAssetId });
  } catch (err) {
    console.error("❌ Gagal set selected car:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getSelectedCar = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) return res.status(404).json({ error: "❌ User tidak ditemukan" });

    return res.json({ selectedCarAssetId: user.selectedCarAssetId ?? 0 });
  } catch (err) {
    console.error("❌ Gagal ambil selected car:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


const getDurabilityList = async (req, res) => {
  try {
    const userId = req.user.id;
    const assetId = parseInt(req.query.assetId);

    if (!Number.isInteger(assetId) || assetId <= 0) {
      return res.status(400).json({ error: "❌ assetId tidak valid" });
    }

    const owned = await UserOwnedCustomizationParts.findAll({
      where: { userId, assetId },
    });

    const result = owned.map(item => ({
      partType: item.partType,
      value: item.value,
      durability: item.durability,
    }));

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error("❌ Gagal ambil durability parts:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = {
  getCustomization,
  purchaseCar,
  purchaseCustomizationPart,
  getUnlockedCustomizationParts,
  saveCustomization,
  upgradeCarPart,
  getUpgradeLevel,
  reduceDurabilityBatch,
  setSelectedCar,
  getSelectedCar,
  getDurabilityList,
  getOwnedPartLevel
};


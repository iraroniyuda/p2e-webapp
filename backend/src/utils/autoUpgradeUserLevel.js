const { Op } = require("sequelize");
const User = require("../models/User");
const UserTransaction = require("../models/UserTransaction");
const TopupPackage = require("../models/TopupPackage");

const USER_LEVEL = {
  white: 1,
  green: 2,
  blue: 3,
  double_blue: 4,
};

const EXCHANGER_LEVEL = {
  none: 0,
  mid: 1,
  senior: 2,
  executive: 3,
};

const exchangerTitles = ["exchanger mid", "exchanger senior", "exchanger executive"];

/**
 * Ambil harga threshold dari DB berdasarkan nama paket
 * @param {string} titleLike
 * @returns {Promise<number>}
 */
const getPackageThreshold = async (titleLike) => {
  const pkg = await TopupPackage.findOne({
    where: {
      title: { [Op.iLike]: `%${titleLike}%` },
    },
  });
  return pkg?.priceRupiah || 0;
};

/**
 * Cek apakah judul mengandung substring valid dari daftar exchanger resmi
 */
const isValidExchangerTitle = (title = "") => {
  const lower = title.toLowerCase();
  return exchangerTitles.some((exTitle) => lower.includes(exTitle));
};

/**
 * Fungsi utama untuk upgrade level user
 * @param {User} user
 * @param {TopupPackage|null} topupPackage
 */
const autoUpgradeUserLevel = async (user, topupPackage = null) => {
  let changed = false;

  // Ambil threshold harga paket user level
  const [hargaGreen, hargaBlue, hargaDoubleBlue] = await Promise.all([
    getPackageThreshold("paket green"),
    getPackageThreshold("paket blue"),
    getPackageThreshold("double blue"),
  ]);

  // === 🟢 Upgrade USER LEVEL via pembelian paket
  if (topupPackage) {
    const title = topupPackage.title.toLowerCase();

    if (title.includes("green") && USER_LEVEL[user.userLevel] < USER_LEVEL.green) {
      user.userLevel = "green"; changed = true;
    }
    if (title.includes("blue") && !title.includes("double") && USER_LEVEL[user.userLevel] < USER_LEVEL.blue) {
      user.userLevel = "blue"; changed = true;
    }
    if (title.includes("double") && USER_LEVEL[user.userLevel] < USER_LEVEL.double_blue) {
      user.userLevel = "double_blue"; changed = true;
    }

    // ✅ Hanya naik exchanger level jika beli paket yang sesuai
    if (title.includes("exchanger mid") && EXCHANGER_LEVEL[user.exchangerLevel] < EXCHANGER_LEVEL.mid) {
      user.exchangerLevel = "mid"; changed = true;
    }
    if (title.includes("exchanger senior") && EXCHANGER_LEVEL[user.exchangerLevel] < EXCHANGER_LEVEL.senior) {
      user.exchangerLevel = "senior"; changed = true;
    }
    if (title.includes("exchanger executive") && EXCHANGER_LEVEL[user.exchangerLevel] < EXCHANGER_LEVEL.executive) {
      user.exchangerLevel = "executive"; changed = true;
    }
  }

  // === 🔄 Upgrade USER LEVEL via top-up manual ke BLUE (tetap dibolehkan)
  if (user.userLevel === "green" && hargaGreen > 0 && hargaBlue > 0) {
    const manualTopups = await UserTransaction.findAll({
      where: {
        userId: user.id,
        type: "TOPUP",
        status: "Sales",
        description: { [Op.iLike]: "Top-Up Manual%" },
      },
    });
    const totalManual = manualTopups.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
    if (totalManual >= (hargaBlue - hargaGreen)) {
      user.userLevel = "blue"; changed = true;
    }
  }

  if (changed) await user.save();
};


module.exports = autoUpgradeUserLevel;

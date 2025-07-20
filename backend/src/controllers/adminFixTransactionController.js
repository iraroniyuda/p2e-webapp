const User = require("../models/User");
const UserTransaction = require("../models/UserTransaction");
const TopupPackage = require("../models/TopupPackage");

const getManualTopupRule = require("../utils/getManualTopupRule");
const manualTopupProcessor = require("../utils/manualTopupProcessor");
const packageTopupProcessor = require("../utils/packageTopupProcessor");
const autoUpgradeUserLevel = require("../utils/autoUpgradeUserLevel");

const fixPreview = async (req, res) => {
  try {
    const unApplied = await UserTransaction.findAll({
      where: { status: "Sales", isApplied: false },
      include: [
        { model: User, as: "user", attributes: ["id", "username", "userLevel", "exchangerLevel"] },
        { model: User, as: "exchanger", attributes: ["id", "username", "isCompanyExchanger", "exchangerLevel"], paranoid: false },
      ],
    });
    res.json(unApplied);
  } catch (err) {
    console.error("❌ Gagal ambil transaksi isApplied:false:", err);
    res.status(500).json({ error: "Gagal ambil data" });
  }
};

const fixApply = async (req, res) => {
  try {
    const unApplied = await UserTransaction.findAll({
      where: { status: "Sales", isApplied: false },
      include: [
        { model: User, as: "user" },
        { model: User, as: "exchanger", attributes: ["id", "username", "isCompanyExchanger", "exchangerLevel"], paranoid: false },
      ],
    });

    let successCount = 0;

    for (const tx of unApplied) {
      try {
        console.log("📌 Proses awal tx.id =", tx.id, "type =", tx.type, "desc =", tx.description);

        const user = tx.user;
        if (!user) {
          console.warn(`⚠️ User ID ${tx.userId} tidak ditemukan`);
          continue;
        }

        // Tentukan tipe transaksi
        let type = tx.type;
        if (!type || type === "TOPUP") {
          type = tx.description?.startsWith("Beli Paket:") ? "buy_package" : "manual_topup";
        }

        if (type === "manual_topup") {
          let exchanger = tx.exchanger;
          if (!exchanger && tx.exchangerId) {
            exchanger = await User.findOne({
              where: { id: tx.exchangerId },
              attributes: ["id", "username", "isCompanyExchanger", "exchangerLevel"],
              paranoid: false,
            });
          }

          if (!exchanger) {
            console.warn(`⚠️ Exchanger tidak ditemukan untuk tx ID ${tx.id}`);
            continue;
          }

          const rule = await getManualTopupRule(exchanger, user);
          if (!rule) {
            console.warn(`⚠️ Rule manual topup tidak ditemukan untuk tx ID ${tx.id}`);
            continue;
          }

          await manualTopupProcessor(tx, user, rule);

        } else if (type === "buy_package") {
          const pkgTitle = tx.description?.replace("Beli Paket: ", "")?.trim();
          if (!pkgTitle) {
            console.warn(`⚠️ Paket title kosong di tx ID ${tx.id}`);
            continue;
          }

          const pkg = await TopupPackage.findOne({ where: { title: pkgTitle } });
          if (!pkg) {
            console.warn(`⚠️ Paket "${pkgTitle}" tidak ditemukan untuk tx ID ${tx.id}`);
            continue;
          }

          await packageTopupProcessor(tx, user, pkg);
        }

        tx.isApplied = true;
        if (!tx.type) tx.type = type;
        await tx.save();
        successCount++;

      } catch (err) {
        console.error(`❌ Gagal apply tx ${tx.id}:`, err.message);
      }
    }

    res.json({ message: `✅ Berhasil apply ${successCount} transaksi` });
  } catch (err) {
    console.error("❌ Gagal apply transaksi:", err);
    res.status(500).json({ error: "Gagal apply transaksi" });
  }
};

module.exports = {
  fixPreview,
  fixApply,
};

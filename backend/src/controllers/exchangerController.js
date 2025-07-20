const { Op } = require("sequelize");
const Decimal = require("decimal.js");
const User = require("../models/User");
const UserBalance = require("../models/UserBalance");

exports.getAllAvailableExchangers = async (req, res) => {
  try {
    const { amount: amountRaw = "0", type = "sbp" } = req.query;
    const amount = new Decimal(amountRaw);

    if (amount.lte(0)) {
      console.warn("⚠️ Amount tidak valid atau <= 0. Stop proses.");
      return res.status(400).json([]);
    }

    // Tentukan field berdasarkan jenis konversi
    const field = type === "rupiah" ? "rupiahForSell" : "sbpForSale";

    const candidates = await User.findAll({
      where: {
        id: { [Op.ne]: req.user.id },
        [Op.or]: [
          { isCompanyExchanger: true },
          { exchangerLevel: { [Op.in]: ["mid", "senior", "executive"] } },
        ],
      },
      include: [{ model: UserBalance, as: "balance" }],
    });

    const result = candidates
      .filter((u) => {
        const available = new Decimal(u.balance?.[field] || 0);
        const pass = available.gte(amount);
        console.log(`🔍 ${u.username}: available = ${available}, pass = ${pass}`);
        return u.balance && pass;
      })
      .map((u) => ({
        id: u.id,
        username: u.username,
        isCompany: u.isCompanyExchanger === true,
        wallet: u.wallet,
        available: new Decimal(u.balance?.[field] || 0).toFixed(),
      }));

    console.log(`✅ Total exchanger lolos filter (${type}):`, result.length);
    return res.json(result);
  } catch (err) {
    console.error("❌ Failed to fetch available exchangers:", err);
    return res.status(500).json([]);
  }
};



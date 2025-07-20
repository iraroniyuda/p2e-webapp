// src/controllers/manualTopupPublicController.js
const ManualTopupConfig = require("../models/ManualTopupConfig");
const User = require("../models/User");

const getManualTopupRulePublic = async (req, res) => {
  try {
    const buyer = await User.findByPk(req.user.id);
    if (!buyer) return res.status(404).json({ error: "User not found" });

    const isBuyerExchanger = ["mid", "senior", "executive"].includes(buyer.exchangerLevel);
    const toType = isBuyerExchanger ? "user_exchanger" : "user_regular";

    const selectedExchangerId = req.query.exchangerId;
    if (!selectedExchangerId) {
      return res.status(400).json({ error: "Exchanger belum dipilih." });
    }

    let fromType = "company";
    if (Number(selectedExchangerId) !== buyer.id) {
      const exchanger = await User.findByPk(selectedExchangerId);
      if (exchanger && ["mid", "senior", "executive"].includes(exchanger.exchangerLevel)) {
        fromType = "user_exchanger";
      }
    }

    console.log("🔍 Topup Rule:", { fromType, toType });

    const config = await ManualTopupConfig.findOne({
      where: { fromType, toType },
      order: [["id", "ASC"]],
    });

    res.json(config || {});
  } catch (err) {
    console.error("❌ Failed to fetch manual rule:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = { getManualTopupRulePublic };

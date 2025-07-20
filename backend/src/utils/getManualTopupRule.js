const ManualTopupConfig = require("../models/ManualTopupConfig");

const getManualTopupRule = async (fromUser, toUser) => {
  if (!fromUser || !toUser) {
    console.warn("⚠️ getManualTopupRule: fromUser atau toUser null");
    return null;
  }

  const fromType = fromUser.isCompanyExchanger
    ? "company"
    : ["mid", "senior", "executive"].includes(fromUser.exchangerLevel)
      ? "user_exchanger"
      : "user_regular";

  const toType = ["mid", "senior", "executive"].includes(toUser.exchangerLevel)
    ? "user_exchanger"
    : "user_regular";

  if (fromType === "user_regular") return null;

  return await ManualTopupConfig.findOne({
    where: { fromType, toType },
  });
};

module.exports = getManualTopupRule;

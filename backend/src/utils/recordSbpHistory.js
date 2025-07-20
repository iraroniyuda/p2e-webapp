const { Decimal } = require("decimal.js");
const SbpTokenHistory = require("../models/SbpTokenHistory");

module.exports = async function recordSbpHistory({ type, amount, user, note }) {
  if (!type || !["sale", "bonus", "transfer", "burn"].includes(type)) {
    console.warn("⚠️ recordSbpHistory: tipe tidak dikenali atau tidak boleh dicatat di sini:", type);
    return;
  }

  const decAmount = new Decimal(amount || 0);
  if (decAmount.lte(0)) {
    console.warn("⚠️ recordSbpHistory: Jumlah tidak valid:", decAmount.toFixed());
    return;
  }

  const fields = {
    type,
    minted: "0",
    burned: type === "burn" ? decAmount.toFixed() : "0",
    transferred: type === "transfer" ? decAmount.toFixed() : "0",
    bonus: type === "bonus" ? decAmount.toFixed() : "0",
    sale: type === "sale" ? decAmount.toFixed() : "0",
    note,
  };

  if (user?.id) {
    fields.userId = user.id;
  }

  await SbpTokenHistory.create(fields);
  console.log(`📝 recordSbpHistory: +${decAmount.toFixed()} SBP dicatat sebagai '${type}'`);
};

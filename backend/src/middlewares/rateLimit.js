// middlewares/rateLimit.js
const rateLimit = require("express-rate-limit");

const miningLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 menit
  max: 30, // max 30 request per 10 menit
  message: "Terlalu sering melakukan aksi mining. Silakan coba lagi nanti.",
});

module.exports = { miningLimiter };

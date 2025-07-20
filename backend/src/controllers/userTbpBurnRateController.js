const TbpBurnRateConfig = require("../models/TbpBurnRateConfig");
const User = require("../models/User");
const UserActivationProgress = require("../models/UserActivationProgress");

/**
 * Helper: mapping nama paket dari progress ke nama type di config
 * Contoh: "Paket Green" -> "green", "Paket Blue" -> "blue", dst
 */
function mapPackageNameToType(raw) {
  if (!raw) return null;
  // Ambil 'green', 'blue', 'double_blue' (case insensitive, buang kata "paket" dan spasi)
  const lower = raw.toLowerCase().replace(/paket\s*/gi, '').replace(/\s+/g, '_');
  if (["green", "blue", "double_blue"].includes(lower)) return lower;
  return null;
}

/**
 * Ambil burn rate aktif (atau pending) user login.
 * GET /user/tbp-burn-rate
 */
const getTbpBurnRate = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User tidak ditemukan." });

    const progress = await UserActivationProgress.findOne({ where: { userId } });

    let type = "";
    let source = "active";
    let debug = {};

    if (progress && !progress.isActivated && progress.packageName) {
      // Jika user masih proses aktivasi
      const packageType = mapPackageNameToType(progress.packageName);
      if (!packageType) {
        return res.status(400).json({ error: "Paket aktivasi tidak valid.", packageName: progress.packageName });
      }
      type = `activation_${packageType}_pending`; // "activation_green_pending", dst
      source = "pending";
      debug.packageType = packageType;
    } else {
      // Sudah aktif, ambil dari userLevel
      type = user.userLevel || "green";
    }

    debug.userLevel = user.userLevel;
    debug.packageName = progress?.packageName;
    debug.typeDipakai = type;

    // --- Logging audit ---
    console.log("[TbpBurnRate] UserID:", userId, debug);

    // Query ke config
    const config = await TbpBurnRateConfig.findOne({ where: { type } });
    if (!config) {
      return res.status(404).json({ error: "Konfigurasi burn rate tidak ditemukan.", type });
    }

    // --- Respon frontend ---
    res.json({
      type: config.type,                      // type yang dipakai (string)
      burnRate: Number(config.burnRate) / 100, // dikonversi ke 0.xx
      source,                                  // "active" atau "pending"
    });

  } catch (err) {
    console.error("❌ Gagal ambil burn rate:", err);
    res.status(500).json({ error: "Gagal mengambil burn rate." });
  }
};

module.exports = { getTbpBurnRate };

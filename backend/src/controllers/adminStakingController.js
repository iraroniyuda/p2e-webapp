const Decimal = require("decimal.js");
const StakingConfig = require("../models/StakingConfig");

// 🔹 Helper untuk parsing desimal aman
const parseDecimalInput = (value) => {
  try {
    return new Decimal(value || 0).toFixed();
  } catch {
    return "0";
  }
};

exports.getStakingConfig = async (req, res) => {
  try {
    const config = await StakingConfig.findOne({ where: { id: 1 } });
    if (!config) {
      return res.status(404).json({ error: "Konfigurasi staking belum disiapkan." });
    }
    res.json(config);
  } catch (err) {
    console.error("❌ getStakingConfig error:", err);
    res.status(500).json({ error: "Gagal mengambil konfigurasi staking." });
  }
};

exports.updateStakingConfig = async (req, res) => {
  try {
    const [config] = await StakingConfig.findOrCreate({ where: { id: 1 } });

    await config.update({
      minStakeAmount: parseDecimalInput(req.body.minStakeAmount),
      rewardPerCycle: parseDecimalInput(req.body.rewardPerCycle),
      dailyRewardPercent: parseDecimalInput(req.body.dailyRewardPercent),
      cycleDurationDays: isNaN(req.body.cycleDurationDays) ? 0 : Number(req.body.cycleDurationDays),
      cooldownAfterUnstake: isNaN(req.body.cooldownAfterUnstake) ? 0 : Number(req.body.cooldownAfterUnstake),
      stakeStartTime: req.body.stakeStartTime || null,
      stakeEndTime: req.body.stakeEndTime || null,
      maxStakePerUser: parseDecimalInput(req.body.maxStakePerUser),
      maxTotalStaked: parseDecimalInput(req.body.maxTotalStaked),
    });

    res.json({ message: "✅ Konfigurasi staking diperbarui", config });
  } catch (err) {
    console.error("❌ updateStakingConfig error:", err);
    res.status(500).json({ error: "Gagal memperbarui konfigurasi staking." });
  }
};

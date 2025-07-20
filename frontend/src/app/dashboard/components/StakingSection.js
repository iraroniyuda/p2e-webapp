"use client";

import {
  claimStakingReward,
  compoundStakingReward,
  getMyStakingStatus,
  getPublicStakingConfig,
  stakeSbp,
  unstakeAndClaim,
} from "@/services/apiClient";
import { useEffect, useState } from "react";

export default function StakingSection() {
  const [amount, setAmount] = useState("");
  const [stakingList, setStakingList] = useState([]);
  const [config, setConfig] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statusRes, configRes] = await Promise.all([
        getMyStakingStatus(),
        getPublicStakingConfig(),
      ]);
      setStakingList(statusRes.data || []);
      setConfig(configRes || null);
    } catch (err) {
      setMessage("❌ Gagal memuat data staking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStake = async () => {
    const num = Number(amount);
    if (!num || num <= 0) {
      setMessage("❌ Masukkan jumlah stake yang valid");
      return;
    }

    setLoading(true);
    try {
      const result = await stakeSbp(num);
      setMessage(result.message);
      setAmount("");
      await fetchData();
    } catch (err) {
      setMessage(err.response?.data?.error || "❌ Gagal staking");
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async () => {
    setLoading(true);
    try {
      const result = await unstakeAndClaim();
      setMessage(result.message);
      await fetchData();
    } catch (err) {
      setMessage(err.response?.data?.error || "❌ Gagal unstake");
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    setLoading(true);
    try {
      const result = await claimStakingReward();
      setMessage(result.message);
      await fetchData();
    } catch (err) {
      setMessage(err.response?.data?.error || "❌ Gagal klaim reward");
    } finally {
      setLoading(false);
    }
  };

  const handleCompound = async () => {
    setLoading(true);
    try {
      const result = await compoundStakingReward();
      setMessage(result.message);
      await fetchData();
    } catch (err) {
      setMessage(err.response?.data?.error || "❌ Gagal compound reward");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-white">
      <h2 className="mb-4">Staking SBP</h2>

      {message && <div className="alert alert-info">{message}</div>}

      <div className="mb-3">
        <label className="form-label">Jumlah SBP untuk Stake</label>
        <input
          type="number"
          className="form-control"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={loading}
        />
        <button
          className="btn btn-primary mt-2"
          onClick={handleStake}
          disabled={loading}
        >
          Stake Sekarang
        </button>
      </div>

      <div className="mb-4 d-flex flex-wrap gap-2">
        <button className="btn btn-success" onClick={handleClaim} disabled={loading}>
          Klaim Reward
        </button>
        <button className="btn btn-info" onClick={handleCompound} disabled={loading}>
          Compound (Tambah ke Stake)
        </button>
        <button className="btn btn-warning" onClick={handleUnstake} disabled={loading}>
          Unstake dan Klaim Semua
        </button>
      </div>

      <h4 className="mt-4">Riwayat Staking</h4>
      {stakingList.length === 0 ? (
        <p className="text-muted">Belum ada data staking.</p>
      ) : (
        <ul className="list-group">
          {stakingList.map((item) => (
            <li key={item.id} className="list-group-item bg-dark text-white">
              <div>💰 <strong>{item.amount} SBP</strong></div>
              <div>⏳ Stake: {new Date(item.stakeTime).toLocaleString()}</div>
              {item.unstakeTime && (
                <div>✅ Unstake: {new Date(item.unstakeTime).toLocaleString()}</div>
              )}
              <div>
                🎁 Reward: {item.rewardClaimed ? "✔️ Sudah diklaim / hangus" : "❌ Belum diklaim"}
              </div>
            </li>
          ))}
        </ul>
      )}

      {config && (
        <div className="mt-5">
          <h5>📜 Info Konfigurasi Staking</h5>
          <p>🔹 Minimum Stake: {config.minStakeAmount} SBP</p>
          <p>🎁 Reward Harian: {config.dailyRewardPercent}%</p>
          <p>🕒 Durasi Cycle: {config.cycleDurationDays} hari</p>
          <p>❄️ Cooldown setelah Unstake: {config.cooldownAfterUnstake} hari</p>
        </div>
      )}
    </div>
  );
}

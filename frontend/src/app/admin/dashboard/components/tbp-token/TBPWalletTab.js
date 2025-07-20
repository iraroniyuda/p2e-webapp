"use client";
import {
  burnTbpAdmin,
  getTBPTokenInfo,
  getTbpStakingConfig,
  lockTbpP2PTransfer,
  mintTbpAdmin,
  setMinimumStakeTime,
  setRewardRate,
  setStakingCap,
  transferTbpAdmin,
  transferTbpOwnership,
  unlockTbpP2PTransfer,
} from "@/services/apiClient";
import { useEffect, useState } from "react";

export default function TBPWalletTab() {
  // State utama
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [totalSupply, setTotalSupply] = useState(null);
  const [p2pAllowed, setP2pAllowed] = useState(null);

  // State staking config (DB/BE)
  const [stakingConfig, setStakingConfig] = useState({
    rewardRate: "",
    minStakeTime: "",
    stakingCap: "",
  });

  // State input config (auto sync dgn DB value)
  const [inputConfig, setInputConfig] = useState({
    rewardRate: "",
    minStakeTime: "",
    stakingCap: "",
  });

  // Admin actions & feedback
  const [status, setStatus] = useState("");
  const [actionStatus, setActionStatus] = useState({});
  const [loading, setLoading] = useState({});

  // Form
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [burnAmount, setBurnAmount] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [mintAddress, setMintAddress] = useState("");
  const [mintAmount, setMintAmount] = useState("");

  // Fetch token info & staking config
  const fetchAllInfo = async () => {
    try {
      const [tokenInfo, config] = await Promise.all([
        getTBPTokenInfo(),
        getTbpStakingConfig(),
      ]);
      setWallet(tokenInfo.wallet);
      setBalance(tokenInfo.balance);
      setTotalSupply(tokenInfo.totalSupply);
      setP2pAllowed(tokenInfo.p2pAllowed);

      setStakingConfig(config);
      setInputConfig(config); // Sync form input dgn DB
    } catch (err) {
      setStatus("❌ Gagal ambil info: " + (err.message || err));
    }
  };

  useEffect(() => {
    fetchAllInfo();
    // eslint-disable-next-line
  }, []);

  // Action Handlers (mint/transfer/burn/lock/unlock/transferOwner)
  const handleGenericAction = async (key, action) => {
    setLoading((l) => ({ ...l, [key]: true }));
    setActionStatus((s) => ({ ...s, [key]: `⏳ Memproses...` }));
    try {
      await action();
      setActionStatus((s) => ({ ...s, [key]: "✅ Berhasil!" }));
      await fetchAllInfo();
    } catch (err) {
      setActionStatus((s) => ({
        ...s,
        [key]: "❌ Gagal: " + (err.message || err),
      }));
    } finally {
      setLoading((l) => ({ ...l, [key]: false }));
    }
  };

  // Setter Staking Config
  const handleSetRewardRate = () =>
    handleGenericAction("rewardRate", () =>
      setRewardRate(inputConfig.rewardRate)
    );
  const handleSetMinStakeTime = () =>
    handleGenericAction("minStakeTime", () =>
      setMinimumStakeTime(inputConfig.minStakeTime)
    );
  const handleSetStakeCap = () =>
    handleGenericAction("stakingCap", () =>
      setStakingCap(inputConfig.stakingCap)
    );

  // Admin functions
  const handleMint = () =>
    handleGenericAction("mint", () => mintTbpAdmin(mintAddress, mintAmount));
  const handleTransfer = () =>
    handleGenericAction("transfer", () => transferTbpAdmin(recipient, amount));
  const handleBurn = () =>
    handleGenericAction("burn", () => burnTbpAdmin(burnAmount));
  const handleLock = () =>
    handleGenericAction("lock", () => lockTbpP2PTransfer());
  const handleUnlock = () =>
    handleGenericAction("unlock", () => unlockTbpP2PTransfer());
  const handleTransferOwnership = () =>
    handleGenericAction("transferOwner", () =>
      transferTbpOwnership(newOwner)
    );

  // Input handler config
  const handleInputConfig = (field) => (e) =>
    setInputConfig((v) => ({ ...v, [field]: e.target.value }));

  return (
    <div className="container text-white mt-4">
      <h2 className="mb-3">TBP-Wallet</h2>
      <p>
        <strong>Wallet Owner:</strong> {wallet ?? "-"}
      </p>
      <p>
        <strong>Total Supply:</strong> {totalSupply ?? "-"}
      </p>
      <p>
        <strong>Balance:</strong> {balance ?? "-"} TBP
      </p>
      <p>
        <strong>Status P2P:</strong>{" "}
        {p2pAllowed === null
          ? "-"
          : p2pAllowed
          ? "DIBUKA"
          : "TERKUNCI"}
      </p>

      {/* Lock/Unlock P2P */}
      <div className="d-flex gap-2 mb-3">
        <div>
          <button
            className="btn btn-outline-danger"
            onClick={handleLock}
            disabled={loading.lock}
          >
            {loading.lock ? "⏳ Mengunci..." : "🔒 Lock P2P"}
          </button>
          {actionStatus.lock && (
            <div className="text-info mt-1">{actionStatus.lock}</div>
          )}
        </div>
        <div>
          <button
            className="btn btn-outline-success"
            onClick={handleUnlock}
            disabled={loading.unlock}
          >
            {loading.unlock ? "⏳ Membuka..." : "🔓 Unlock P2P"}
          </button>
          {actionStatus.unlock && (
            <div className="text-info mt-1">{actionStatus.unlock}</div>
          )}
        </div>
      </div>

      {/* Mint */}
      <hr />
      <h5>🪙 Mint TBP (Owner Only)</h5>
      <div className="mb-3">
        <label>Alamat Penerima:</label>
        <input
          type="text"
          className="form-control mb-2"
          value={mintAddress}
          onChange={(e) => setMintAddress(e.target.value)}
          placeholder="0x..."
        />
        <label>Jumlah TBP:</label>
        <input
          type="number"
          className="form-control mb-2"
          value={mintAmount}
          onChange={(e) => setMintAmount(e.target.value)}
          placeholder="Misal: 1000"
        />
        <button
          className="btn btn-success"
          onClick={handleMint}
          disabled={loading.mint}
        >
          {loading.mint ? "⏳ Minting..." : "Mint Token"}
        </button>
        {actionStatus.mint && (
          <div className="text-info mt-2">{actionStatus.mint}</div>
        )}
        <small className="text-warning d-block mt-1">
          ⚠️ Hanya owner kontrak yang dapat melakukan mint.
        </small>
      </div>

      {/* Transfer */}
      <hr />
      <h5>Kirim TBP</h5>
      <div className="mb-2">
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Alamat Tujuan"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        <input
          type="number"
          className="form-control mb-2"
          placeholder="Jumlah TBP"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button
          className="btn btn-success"
          onClick={handleTransfer}
          disabled={loading.transfer}
        >
          {loading.transfer ? "⏳ Mengirim..." : "Kirim TBP"}
        </button>
        {actionStatus.transfer && (
          <div className="alert alert-info mt-2">
            {actionStatus.transfer}
          </div>
        )}
      </div>

      {/* Burn */}
      <hr />
      <h5>🔥 Burn (dari wallet sendiri)</h5>
      <div className="mb-2">
        <input
          type="number"
          className="form-control mb-2"
          placeholder="Jumlah TBP"
          value={burnAmount}
          onChange={(e) => setBurnAmount(e.target.value)}
        />
        <button
          className="btn btn-warning"
          onClick={handleBurn}
          disabled={loading.burn}
        >
          {loading.burn ? "⏳ Burning..." : "🔥 Burn Token Saya"}
        </button>
        {actionStatus.burn && (
          <div className="text-info mt-2">{actionStatus.burn}</div>
        )}
      </div>

      {/* Transfer Ownership */}
      <hr />
      <h5>⚠️ Transfer Ownership</h5>
      <div className="mb-2">
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Alamat Wallet Baru"
          value={newOwner}
          onChange={(e) => setNewOwner(e.target.value)}
        />
        <button
          className="btn btn-danger"
          onClick={handleTransferOwnership}
          disabled={loading.transferOwner}
        >
          {loading.transferOwner
            ? "⏳ Memproses..."
            : "Transfer Kepemilikan"}
        </button>
        <small className="text-warning d-block mt-1">
          ⚠️ Hanya owner kontrak yang dapat melakukan ini.
        </small>
      </div>

      {/* Admin Staking Config */}
      <hr />
      <h5>⚙️ Pengaturan Staking (Admin)</h5>
      <div className="mb-3">
        <label>Reward Rate (wei/detik):</label>
        <input
          type="text"
          className="form-control mb-2"
          value={inputConfig.rewardRate}
          onChange={handleInputConfig("rewardRate")}
          placeholder="Contoh: 1000000000000000000 untuk 1 TBP/detik"
        />
        <button
          className="btn btn-info"
          onClick={handleSetRewardRate}
          disabled={loading.rewardRate}
        >
          {loading.rewardRate ? "⏳ Mengatur..." : "Set Reward Rate"}
        </button>
        {stakingConfig.rewardRate && (
          <small className="text-info d-block">
            Nilai saat ini: <b>{stakingConfig.rewardRate}</b>
          </small>
        )}
      </div>
      <div className="mb-3">
        <label>Minimum Stake Time (detik):</label>
        <input
          type="text"
          className="form-control mb-2"
          value={inputConfig.minStakeTime}
          onChange={handleInputConfig("minStakeTime")}
          placeholder="Contoh: 3600 untuk 1 jam"
        />
        <button
          className="btn btn-info"
          onClick={handleSetMinStakeTime}
          disabled={loading.minStakeTime}
        >
          {loading.minStakeTime ? "⏳ Mengatur..." : "Set Minimum Stake Time"}
        </button>
        {stakingConfig.minStakeTime && (
          <small className="text-info d-block">
            Nilai saat ini: <b>{stakingConfig.minStakeTime}</b>
          </small>
        )}
      </div>
      <div className="mb-3">
        <label>Staking Cap (dalam wei):</label>
        <input
          type="text"
          className="form-control mb-2"
          value={inputConfig.stakingCap}
          onChange={handleInputConfig("stakingCap")}
          placeholder="Contoh: 1000000000000000000000 untuk 1000 TBP"
        />
        <button
          className="btn btn-info"
          onClick={handleSetStakeCap}
          disabled={loading.stakingCap}
        >
          {loading.stakingCap ? "⏳ Mengatur..." : "Set Staking Cap"}
        </button>
        {stakingConfig.stakingCap && (
          <small className="text-info d-block">
            Nilai saat ini: <b>{stakingConfig.stakingCap}</b>
          </small>
        )}
      </div>
      {status && <div className="alert alert-info mt-3">{status}</div>}
    </div>
  );
}

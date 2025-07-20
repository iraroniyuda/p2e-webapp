"use client";
import {
  claimStakingReward,
  getStakeInfo,
  getTokenBalance,
  isP2PAllowed,
  stakeTbp,
  transferTbp,
  unstakeTbp,
} from "@/services/TokenBridge";
import {
  getUserTbpStakingConfig,
  saveTbpStakingHistory,
} from "@/services/apiClient";
import { useEffect, useState } from "react";

const POLYGON_CHAIN_ID = "0x89";
const MIN_STAKE = 5000;

export default function UserTbpWalletTab() {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [stakeInfo, setStakeInfo] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [status, setStatus] = useState("");
  const [p2pAllowed, setP2pAllowed] = useState(false);
  const [stakingConfig, setStakingConfig] = useState(null);
  const [networkReady, setNetworkReady] = useState(false);

  useEffect(() => {
    const checkAndSwitchNetwork = async () => {
      if (!window.ethereum) {
        setStatus("Install Trust Wallet dulu.");
        return;
      }
      try {
        const currentChainId =
          window.ethereum.chainId || (await window.ethereum.request({ method: "eth_chainId" }));
        if (currentChainId !== POLYGON_CHAIN_ID) {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: POLYGON_CHAIN_ID }],
          });
        }
        setNetworkReady(true);
      } catch (err) {
        if (err.code === 4001) {
          setStatus("Kamu harus switch ke jaringan Polygon agar fitur berfungsi.");
        } else if (err.code === 4902) {
          setStatus("Polygon belum ditambahkan ke Trust Wallet. Tambahkan manual.");
        } else {
          setStatus("Gagal switch network: " + (err.message || err));
        }
        setNetworkReady(false);
      }
    };
    checkAndSwitchNetwork();
  }, []);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) return setStatus("Install Trust Wallet dulu.");
      const currentChainId =
        window.ethereum.chainId || (await window.ethereum.request({ method: "eth_chainId" }));
      if (currentChainId !== POLYGON_CHAIN_ID) {
        setStatus("Pastikan jaringan di Trust Wallet adalah Polygon Mainnet.");
        return;
      }
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const address = accounts[0];
      setWallet(address);

      const [bal, sInfo, allowed, config] = await Promise.all([
        getTokenBalance(address),
        getStakeInfo(address),
        isP2PAllowed(),
        getUserTbpStakingConfig(),
      ]);
      setBalance(bal);
      setStakeInfo(sInfo);
      setP2pAllowed(allowed);
      setStakingConfig(config);
      setStatus("");
    } catch (err) {
      setStatus("Gagal ambil data: " + (err.message || err));
    }
  };

  useEffect(() => {
    if (networkReady) {
      connectWallet();
    }
  }, [networkReady]);

  const handleTransfer = async () => {
    try {
      setStatus("⏳ Mengirim...");
      const receipt = await transferTbp(recipient, amount);
      setStatus("✅ Transfer berhasil: " + receipt.transactionHash);
      const bal = await getTokenBalance(wallet);
      setBalance(bal);
    } catch (err) {
      setStatus("❌ Gagal transfer: " + (err.message || err));
    }
  };

  const handleStake = async () => {
    try {
      const numAmount = Number(stakeAmount);
      if (isNaN(numAmount) || numAmount < MIN_STAKE) {
        setStatus(`❌ Minimal stake adalah ${MIN_STAKE} TBP`);
        return;
      }
      setStatus("⏳ Stake...");
      const receipt = await stakeTbp(numAmount);
      await saveTbpStakingHistory({
        action: "stake",
        amount: stakeAmount,
        txHash: receipt.transactionHash,
      });
      setStatus("✅ Stake berhasil: " + receipt.transactionHash);
      setStakeAmount("");
      connectWallet();
    } catch (err) {
      setStatus("❌ Gagal stake: " + (err.message || err));
    }
  };

  const handleUnstake = async () => {
    try {
      setStatus("⏳ Unstake...");
      const receipt = await unstakeTbp(unstakeAmount);
      await saveTbpStakingHistory({
        action: "unstake",
        amount: unstakeAmount,
        txHash: receipt.transactionHash,
      });
      setStatus("✅ Unstake berhasil: " + receipt.transactionHash);
      setUnstakeAmount("");
      connectWallet();
    } catch (err) {
      setStatus("❌ Gagal unstake: " + (err.message || err));
    }
  };

  const handleClaim = async () => {
    try {
      setStatus("⏳ Klaim reward...");
      const receipt = await claimStakingReward();
      await saveTbpStakingHistory({
        action: "claim",
        amount: stakeInfo?.pendingReward || "0",
        txHash: receipt.transactionHash,
      });
      setStatus("✅ Reward diklaim: " + receipt.transactionHash);
      connectWallet();
    } catch (err) {
      setStatus("❌ Gagal klaim reward: " + (err.message || err));
    }
  };

  const parsedStake = Number(stakeAmount);
  const stakeInvalid = isNaN(parsedStake) || parsedStake < MIN_STAKE;

  return (
    <div className="container text-white mt-4">
      <h2 className="mb-3">TBP Wallet - User</h2>
      {wallet && <p><strong>Wallet:</strong> {wallet}</p>}
      <p><strong>Balance:</strong> {balance ?? "-"} TBP</p>
      <p><strong>Status P2P:</strong> {p2pAllowed ? "DIBUKA" : "TERKUNCI"}</p>

      {p2pAllowed && (
        <>
          <hr />
          <h5>🔁 Kirim TBP</h5>
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
          <button className="btn btn-success mb-3" onClick={handleTransfer}>
            Kirim
          </button>
        </>
      )}

      <hr />
      <h5>📊 Info Staking</h5>
      {stakeInfo && (
        <>
          <p><strong>Staked:</strong> {stakeInfo.stakeAmount} TBP</p>
          <p><strong>Reward Tersedia:</strong> {stakeInfo.pendingReward} TBP</p>
          <button className="btn btn-warning mb-3" onClick={handleClaim}>
            Klaim Reward
          </button>
        </>
      )}

      {stakingConfig && (
        <>
          <hr />
          <h5>⚙️ Config Staking (Dari Server)</h5>
          <p><strong>Reward Rate (wei/detik):</strong> {stakingConfig.rewardRate}</p>
          <p><strong>Minimum Stake Time (detik):</strong> {stakingConfig.minStakeTime}</p>
          <p><strong>Staking Cap (wei):</strong> {stakingConfig.stakingCap}</p>
        </>
      )}

      <hr />
      <h5>📥 Stake TBP</h5>
      <small className="text-warning mb-1 d-block">
        Minimal stake: {MIN_STAKE} TBP
      </small>
      <input
        type="number"
        className="form-control mb-2"
        placeholder={`Jumlah TBP (min ${MIN_STAKE})`}
        value={stakeAmount}
        onChange={(e) => setStakeAmount(e.target.value)}
        min={MIN_STAKE}
      />
      <button
        className="btn btn-info mb-3"
        onClick={handleStake}
        disabled={stakeInvalid}
      >
        Stake
      </button>

      <hr />
      <h5>📤 Unstake TBP</h5>
      <input
        type="number"
        className="form-control mb-2"
        placeholder="Jumlah TBP"
        value={unstakeAmount}
        onChange={(e) => setUnstakeAmount(e.target.value)}
      />
      <button className="btn btn-secondary" onClick={handleUnstake}>
        Unstake
      </button>

      {status && (
        <div className="alert alert-info mt-4" role="alert">
          {status}
        </div>
      )}
    </div>
  );
}

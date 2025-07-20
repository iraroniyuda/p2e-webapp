"use client";
import { ethers } from "ethers";
import { useState } from "react";

export default function WalletSection() {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);

  const connectWallet = async () => {
    console.clear();
    console.log("🔵 Memulai koneksi wallet...");

    try {
      if (!window.ethereum) {
        setError("Trust Wallet is not installed.");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const balanceInWei = await provider.getBalance(address);
      const balanceInEther = ethers.utils.formatEther(balanceInWei);

      setWallet(address);
      setBalance(balanceInEther);
      setError(null);
    } catch (err) {
      console.error("❌ Error:", err);
      setError("Gagal menghubungkan Wallet.");
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    setBalance(null);
    setError(null);
    console.log("🔴 Wallet terputus.");
  };

  return (
    <div className="container mt-5 text-white">
      <h2 className="mb-4">Wallet</h2>
      <div className="card p-4 shadow-sm rounded-4">
        <h4>Connected Wallet</h4>
        <hr />
        {wallet ? (
          <>
            <p><strong>Wallet Address:</strong> {wallet}</p>
            <p><strong>Balance (ETH):</strong> {balance} ETH</p>
            <button className="btn btn-danger mt-3" onClick={disconnectWallet}>
              Disconnect Wallet
            </button>
          </>
        ) : (
          <>
            <p className="text-muted">No Wallet Connected.</p>
            <button className="btn btn-primary mt-3" onClick={connectWallet}>
              Connect Wallet
            </button>
          </>
        )}

        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </div>
    </div>
  );
}

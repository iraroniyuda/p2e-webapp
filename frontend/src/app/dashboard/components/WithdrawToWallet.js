"use client";
import { ethers } from "ethers";
import { useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";

export default function WithdrawToWallet() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleWithdraw = async () => {
    if (!amount || isNaN(amount) || amount <= 0) {
      setError("Jumlah tidak valid");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (!window.ethereum) {
        setError("Trust Wallet tidak terdeteksi.");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      // Contoh simulasi transfer dari web ke wallet (dummy)
      const tx = await signer.sendTransaction({
        to: address,
        value: ethers.utils.parseUnits(amount, "ether") // Sesuaikan dengan decimal TBP
      });

      setSuccess(`Sukses withdraw ${amount} TBP ke wallet Anda.`);
    } catch (err) {
      console.error("❌ Error:", err);
      setError("Gagal melakukan withdraw. Pastikan Wallet terhubung.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Jumlah TBP</Form.Label>
        <Form.Control 
          type="number" 
          placeholder="Masukkan jumlah TBP" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
        />
      </Form.Group>
      <Button variant="primary" onClick={handleWithdraw} disabled={loading}>
        {loading ? <Spinner size="sm" animation="border" /> : "Withdraw Sekarang"}
      </Button>

      {error && <p className="text-danger mt-2">{error}</p>}
      {success && <p className="text-success mt-2">{success}</p>}
    </Form>
  );
}

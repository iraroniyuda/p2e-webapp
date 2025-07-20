"use client";
import apiClient from "@/services/apiClient";
import { useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";

export default function ExchangeToFiat() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleExchange = async () => {
    if (!amount || isNaN(amount) || amount <= 0) {
      setError("Jumlah tidak valid");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Simulasi API Exchange ke FIAT
      const response = await apiClient.post("/exchange/fiat", { amount });
      setSuccess(`Sukses menukar ${amount} TBP ke FIAT. Cek saldo FIAT Anda.`);
    } catch (err) {
      setError("Gagal menukar TBP ke FIAT.");
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
      <Button variant="success" onClick={handleExchange} disabled={loading}>
        {loading ? <Spinner size="sm" animation="border" /> : "Exchange ke FIAT"}
      </Button>

      {error && <p className="text-danger mt-2">{error}</p>}
      {success && <p className="text-success mt-2">{success}</p>}
    </Form>
  );
}

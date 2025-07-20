"use client";

import apiClient from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Alert, Button, Form, Spinner, Table } from "react-bootstrap";

export default function SBPAllocationTab() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fromCategory, setFromCategory] = useState("");
  const [toCategory, setToCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchAllocations = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/admin/sbp/allocation-summary");
      setAllocations(res.data);
    } catch (err) {
      console.error("❌ Gagal fetch allocation:", err);
      setError("Gagal mengambil data alokasi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, []);

  const handleTransfer = async () => {
    setMessage(null);
    setError(null);
    try {
      await apiClient.post("/admin/sbp/allocate-transfer", {
        fromCategory,
        toCategory,
        amount: parseInt(amount),
        note,
      });
      setMessage(`✅ Berhasil transfer ${amount} dari ${fromCategory} ke ${toCategory}`);
      setAmount("");
      setNote("");
      fetchAllocations();
    } catch (err) {
      console.error("❌ Gagal transfer:", err);
      setError("Gagal transfer alokasi.");
    }
  };

  return (
    <div>
      <h3 className="mb-4">📊 Ringkasan Alokasi SBP</h3>

      {error && <Alert variant="danger">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Kategori</th>
              <th>Persentase (%)</th>
              <th>Sisa SBP</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((a) => (
              <tr key={a.category}>
                <td>{a.category}</td>
                <td>{a.percent}%</td>
                <td>{a.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <h4 className="mt-5">🔁 Transfer Antar Kategori</h4>
      <Form className="mt-3">
        <Form.Group className="mb-2">
          <Form.Label>Dari Kategori</Form.Label>
          <Form.Select value={fromCategory} onChange={(e) => setFromCategory(e.target.value)}>
            <option value="">-- Pilih --</option>
            {allocations.map((a) => (
              <option key={a.category} value={a.category}>
                {a.category}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Ke Kategori</Form.Label>
          <Form.Select value={toCategory} onChange={(e) => setToCategory(e.target.value)}>
            <option value="">-- Pilih --</option>
            {allocations.map((a) => (
              <option key={a.category} value={a.category}>
                {a.category}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Jumlah SBP</Form.Label>
          <Form.Control
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Catatan (opsional)</Form.Label>
          <Form.Control
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Form.Group>

        <Button onClick={handleTransfer} disabled={!fromCategory || !toCategory || !amount}>
          Transfer SBP
        </Button>
      </Form>
    </div>
  );
}

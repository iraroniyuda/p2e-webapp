"use client";

import { createWithdrawConfig, getWithdrawConfigs, updateWithdrawConfig } from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Alert, Button, Form, Spinner } from "react-bootstrap";

export default function EditWithdrawConfigTab() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("IDR");
  const [status, setStatus] = useState("Active");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    setLoading(true);
    try {
      const res = await getWithdrawConfigs();
      const latest = res?.configs?.[0];
      if (latest) {
        setConfig(latest);
        // Paksa angka bulat (tanpa decimal)
        setAmount(String(Number(latest.minWithdrawAmount || 0)));
        setCurrency(latest.currency);
        setStatus(latest.status);
      }
    } finally {
      setLoading(false);
    }
  }

  // Handle hanya angka bulat
  function handleAmountChange(e) {
    // Hapus semua non-angka
    const val = e.target.value.replace(/[^0-9]/g, "");
    setAmount(val);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      if (config) {
        await updateWithdrawConfig(config.id, {
          minWithdrawAmount: amount,
          currency,
          status,
        });
      } else {
        await createWithdrawConfig({
          minWithdrawAmount: amount,
          currency,
          status,
        });
      }
      setMsg("✅ Minimal withdraw berhasil disimpan.");
      fetchConfig();
    } catch (err) {
      setMsg("❌ Gagal simpan: " + (err?.response?.data?.error || err.message));
    }
    setSaving(false);
  }

  if (loading) return <Spinner animation="border" />;

  return (
    <div className="p-4 rounded bg-white text-black" style={{ maxWidth: 420 }}>
      <h3 className="mb-3">Edit Minimal Withdraw</h3>
      {msg && <Alert variant={msg.startsWith("✅") ? "success" : "danger"}>{msg}</Alert>}
      <Form onSubmit={handleSave}>
        <Form.Group className="mb-3">
          <Form.Label>Minimal Withdraw (Rp)</Form.Label>
          <Form.Control
            type="text"
            pattern="[0-9]*"
            inputMode="numeric"
            value={amount}
            onChange={handleAmountChange}
            min={0}
            required
            autoComplete="off"
            spellCheck={false}
            placeholder="Masukkan angka, contoh: 40000"
          />
          <div className="text-muted mt-1" style={{ fontSize: 15 }}>
            {amount
              ? `Rp${Number(amount).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`
              : "Rp0"}
          </div>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Mata Uang</Form.Label>
          <Form.Control
            type="text"
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Status</Form.Label>
          <Form.Select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Form.Select>
        </Form.Group>
        <Button type="submit" disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan"}
        </Button>
      </Form>
    </div>
  );
}

"use client";

import {
  getDailyAirdropConfig,
  updateDailyAirdropConfig,
} from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Card, Form, Spinner } from "react-bootstrap";

export default function AdminDailyAirdropTab() {
  const [loading, setLoading] = useState(true);
  const [minTransactionAmount, setMinTransactionAmount] = useState(0);
  const [periodDays, setPeriodDays] = useState(7);
  const [sbpReward, setSbpReward] = useState(5);
  const [requiredLoginDays, setRequiredLoginDays] = useState(7);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const config = await getDailyAirdropConfig();
      setMinTransactionAmount(config.minTransactionAmount);
      setPeriodDays(config.periodDays);
      setSbpReward(config.sbpReward);
      setRequiredLoginDays(config.requiredLoginDays ?? 7); // fallback kalau belum ada
    } catch (err) {
      alert("❌ Gagal mengambil konfigurasi");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!minTransactionAmount || !periodDays || !sbpReward || !requiredLoginDays) {
      return alert("Semua field harus diisi");
    }

    try {
      setSaving(true);
      await updateDailyAirdropConfig({
        minTransactionAmount,
        periodDays,
        sbpReward,
        requiredLoginDays,
      });
      alert("✅ Konfigurasi berhasil disimpan");
    } catch (err) {
      alert(err?.response?.data?.error || "❌ Gagal update konfigurasi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-white text-center py-5">
        <Spinner animation="border" variant="light" />
      </div>
    );
  }

  return (
    <div className="text-white">
      <h4 className="mb-4">📅 Konfigurasi Airdrop Harian</h4>

      <Card className="bg-dark text-white">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Minimal Total Transaksi (IDR)</Form.Label>
              <Form.Control
                type="number"
                min={1000}
                value={minTransactionAmount}
                onChange={(e) => setMinTransactionAmount(Number(e.target.value))}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Periode Hari (terakhir)</Form.Label>
              <Form.Control
                type="number"
                min={1}
                value={periodDays}
                onChange={(e) => setPeriodDays(Number(e.target.value))}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Jumlah SBP per Hari Login</Form.Label>
              <Form.Control
                type="number"
                min={1}
                value={sbpReward}
                onChange={(e) => setSbpReward(Number(e.target.value))}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Jumlah Hari Login untuk Klaim</Form.Label>
              <Form.Control
                type="number"
                min={1}
                value={requiredLoginDays}
                onChange={(e) => setRequiredLoginDays(Number(e.target.value))}
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Konfigurasi"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

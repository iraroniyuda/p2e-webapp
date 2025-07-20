"use client";

import { getStakingConfig, updateStakingConfig } from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Alert, Button, Form, Spinner } from "react-bootstrap";

export default function StakingConfigTab() {
  const [config, setConfig] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await getStakingConfig();
        setConfig(data);
        setForm({ ...data });
      } catch (err) {
        setMessage("❌ Gagal memuat konfigurasi.");
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setMessage("");
    try {
      await updateStakingConfig(form);
      setMessage("✅ Konfigurasi staking berhasil disimpan.");
    } catch (err) {
      console.error("Gagal simpan staking config:", err);
      setMessage("❌ Gagal menyimpan konfigurasi.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner animation="border" variant="light" />;

  return (
    <div className="text-white">
      <h5 className="mb-4">Konfigurasi Staking SBP</h5>
      <Form>

        <Form.Group className="mb-3">
          <Form.Label>Minimal Stake (SBP)</Form.Label>
          <Form.Control
            type="number"
            step="0.000000000000000001"
            name="minStakeAmount"
            value={form.minStakeAmount || ""}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Persentase Reward Harian (%)</Form.Label>
          <Form.Control
            type="number"
            step="0.000001"
            name="dailyRewardPercent"
            value={form.dailyRewardPercent || ""}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Durasi Cycle (hari)</Form.Label>
          <Form.Control
            type="number"
            name="cycleDurationDays"
            value={form.cycleDurationDays || ""}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Cooldown Setelah Unstake (hari)</Form.Label>
          <Form.Control
            type="number"
            name="cooldownAfterUnstake"
            value={form.cooldownAfterUnstake || ""}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Maksimal Stake per User</Form.Label>
          <Form.Control
            type="number"
            step="0.000000000000000001"
            name="maxStakePerUser"
            value={form.maxStakePerUser || ""}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Maksimal Total Stake (Global)</Form.Label>
          <Form.Control
            type="number"
            step="0.000000000000000001"
            name="maxTotalStaked"
            value={form.maxTotalStaked || ""}
            onChange={handleChange}
          />
        </Form.Group>

        <Button variant="primary" onClick={handleSubmit} disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan Konfigurasi"}
        </Button>

        {message && <Alert className="mt-3" variant={message.startsWith("✅") ? "success" : "danger"}>{message}</Alert>}
      </Form>
    </div>
  );
}

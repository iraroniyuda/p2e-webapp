"use client";

import { getMiningConfig, updateMiningConfig } from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";

export default function MiningConfigTab() {
  const [form, setForm] = useState({
    sbpPerClickGroup: 10,
    sbpRewardAmount: 1,
    tbpRewardAmount: 0,
    rewardType: "SBP",
  });

  const [loading, setLoading] = useState(false);

  const fetchConfig = async () => {
    try {
      const data = await getMiningConfig();
      setForm(data);
    } catch (err) {
      console.error("❌ Gagal memuat config mining:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await updateMiningConfig(form);
      alert("✅ Konfigurasi mining berhasil diperbarui.");
    } catch (err) {
      console.error("❌ Gagal update config:", err);
      alert("Gagal menyimpan konfigurasi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <Card bg="dark" text="white" className="p-4">
      <h5 className="mb-3">Pengaturan Reward Mining</h5>
      <Form>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Valid Click per Grup</Form.Label>
              <Form.Control
                type="number"
                name="sbpPerClickGroup"
                value={form.sbpPerClickGroup}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Reward SBP per Grup</Form.Label>
              <Form.Control
                type="number"
                name="sbpRewardAmount"
                value={form.sbpRewardAmount}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Reward TBP per Grup</Form.Label>
              <Form.Control
                type="number"
                name="tbpRewardAmount"
                value={form.tbpRewardAmount}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Jenis Reward</Form.Label>
              <Form.Select
                name="rewardType"
                value={form.rewardType}
                onChange={handleChange}
              >
                <option value="SBP">SBP</option>
                <option value="TBP">TBP</option>
                <option value="BOTH">BOTH</option>
              </Form.Select>
            </Form.Group>

            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
}

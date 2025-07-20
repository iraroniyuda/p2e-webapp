"use client";

import { getReferralBonusConfigs, updateReferralBonus } from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Form, Spinner, Table } from "react-bootstrap";

export default function EditReferralBonusTab() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edited, setEdited] = useState({});

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await getReferralBonusConfigs();
      setConfigs(res);
    } catch (err) {
      console.error("❌ Gagal load config referral:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id, field, value) => {
    setEdited((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSave = async (id) => {
    try {
      const payload = edited[id];
      if (!payload) return;

      await updateReferralBonus(
        id,
        payload.directBonusPercent,
        payload.gen1BonusPercent,
        payload.gen2BonusPercent,
        payload.gen3BonusPercent,
        payload.gen4BonusPercent,
        payload.gen5BonusPercent,
        payload.gen6BonusPercent,
      );

      alert("✅ Bonus referral berhasil diperbarui");
      fetchConfigs(); // Refresh data
    } catch (err) {
      alert("❌ Gagal update bonus referral");
      console.error(err);
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h5 className="mb-3 text-white">Edit Bonus Referral per Level</h5>
      <Table striped bordered hover responsive variant="dark">
        <thead>
          <tr>
            <th>Level</th>
            <th>Direct %</th>
            <th>Gen 1</th>
            <th>Gen 2</th>
            <th>Gen 3</th>
            <th>Gen 4</th>
            <th>Gen 5</th>
            <th>Gen 6</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {configs.map((cfg) => (
            <tr key={cfg.id}>
              <td>{cfg.userLevel}</td>
              {["directBonusPercent", "gen1BonusPercent", "gen2BonusPercent", "gen3BonusPercent", "gen4BonusPercent", "gen5BonusPercent", "gen6BonusPercent"].map((field) => (
                <td key={field}>
                  <Form.Control
                    type="number"
                    value={edited[cfg.id]?.[field] ?? parseFloat(cfg[field])}
                    onChange={(e) => handleChange(cfg.id, field, e.target.value)}
                  />
                </td>
              ))}
              <td>
                <Button onClick={() => handleSave(cfg.id)}>💾 Simpan</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

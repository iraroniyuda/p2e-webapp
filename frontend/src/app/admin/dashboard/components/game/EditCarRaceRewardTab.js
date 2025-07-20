// src/components/game/EditCarRaceRewardTab.jsx
"use client";

import {
    getCarRaceRewardConfigs,
    updateCarRaceRewardConfig,
} from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Form, Spinner, Table } from "react-bootstrap";

export default function EditCarRaceRewardTab() {
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState([]);
  const [edited, setEdited] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const data = await getCarRaceRewardConfigs();
      setRewards(data);
    } catch (err) {
      alert("Gagal memuat data reward.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (assetId, value) => {
    setEdited((prev) => ({ ...prev, [assetId]: value }));
  };

  const handleSave = async (assetId) => {
    setSaving(true);
    try {
      await updateCarRaceRewardConfig(assetId, edited[assetId]);
      await fetchRewards();
      setEdited((prev) => ({ ...prev, [assetId]: undefined }));
    } catch (err) {
      alert("Gagal menyimpan reward.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-4">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-3">Edit Reward SBP per Mobil</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Asset ID</th>
            <th>Nama Mobil</th>
            <th>Reward SBP (jika menang)</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rewards.map(({ assetId, carName, winSbp }) => (
            <tr key={assetId}>
              <td>{assetId}</td>
              <td>{carName}</td>
              <td>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={edited[assetId] ?? winSbp}
                  onChange={(e) => handleChange(assetId, e.target.value)}
                />
              </td>
              <td>
                <Button
                  size="sm"
                  variant="success"
                  disabled={saving || edited[assetId] == null}
                  onClick={() => handleSave(assetId)}
                >
                  Simpan
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

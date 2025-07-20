"use client";

import {
  getRaceEntryFeeConfigs,
  setRaceEntryFee,
} from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Form, Spinner, Table } from "react-bootstrap";

export default function EditRaceEntryFeeTab() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState({}); // assetId: { feeAmount }

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await getRaceEntryFeeConfigs();
      setConfigs(res);
    } catch (err) {
      console.error("❌ Gagal mengambil konfigurasi:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id, value) => {
    setEditing((prev) => ({
      ...prev,
      [id]: { feeAmount: value },
    }));
  };

  const handleSave = async (id) => {
    const edited = editing[id];
    const config = configs.find((c) => c.assetId === id);
    const feeAmount = edited?.feeAmount ?? config?.feeAmount;
    const feeCurrency = config?.feeCurrency;

    if (!feeAmount || !feeCurrency) {
      alert("❌ Fee atau currency tidak boleh kosong.");
      return;
    }

    try {
      await setRaceEntryFee({ assetId: id, feeAmount, feeCurrency });
      await fetchConfigs(); // refresh
    } catch (err) {
      alert("❌ Gagal menyimpan. Cek console.");
      console.error(err);
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h2 className="mb-4">Edit Biaya Entry Balapan</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Mobil</th>
            <th>Fee</th>
            <th>Mata Uang</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {configs.map((config) => {
            const edit = editing[config.assetId] || {};
            return (
              <tr key={config.assetId}>
                <td>{config.carAsset?.name}</td>
                <td>
                  <Form.Control
                    type="number"
                    value={edit.feeAmount ?? config.feeAmount}
                    onChange={(e) =>
                      handleChange(config.assetId, e.target.value)
                    }
                  />
                </td>
                <td>
                  <span>{config.feeCurrency}</span>
                </td>
                <td>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleSave(config.assetId)}
                  >
                    Simpan
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}

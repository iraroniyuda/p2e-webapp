"use client";

import apiClient, { updatePolClaimConfig } from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Alert, Button, Form, Spinner, Table } from "react-bootstrap";

export default function PolClaimConfigTab() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchConfigs = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await apiClient.get("/admin/pol-claim-config/list");
      setConfigs(res.data.data);
      setEditValues({});
    } catch (err) {
      setError("Gagal memuat data.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleInput = (id, val) => {
    // Ganti koma jadi titik otomatis
    setEditValues((prev) => ({
      ...prev,
      [id]: val.replace(",", "."),
    }));
  };

  // Pastikan param: levelName, amountPOL
  const handleSave = async (id) => {
    setError(""); setSuccess("");
    const item = configs.find((c) => c.id === id);
    const levelName = item?.levelName;
    let amountPOL = editValues[id] !== undefined ? editValues[id] : item?.amountPOL;
    amountPOL = String(amountPOL).replace(",", "."); // handle comma input

    if (!levelName || amountPOL === "" || isNaN(Number(amountPOL))) {
      setError("Level dan nominal POL wajib diisi dengan benar (gunakan titik untuk desimal)");
      return;
    }
    setSavingId(id);
    try {
      await updatePolClaimConfig(levelName, amountPOL);
      setSuccess("Berhasil diupdate!");
      await fetchConfigs();
    } catch (err) {
      setError(err?.response?.data?.error || "Gagal update.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <h3 className="mb-4">Konfigurasi Nominal POL per Level</h3>
      {error && <Alert variant="danger" className="py-2 px-3">{error}</Alert>}
      {success && <Alert variant="success" className="py-2 px-3">{success}</Alert>}
      {loading ? (
        <Spinner animation="border" variant="info" />
      ) : (
        <Table bordered striped hover variant="dark" size="sm" responsive>
          <thead>
            <tr>
              <th style={{ minWidth: 120 }}>Level</th>
              <th style={{ minWidth: 150 }}>Nominal POL</th>
              <th style={{ width: 120 }}></th>
            </tr>
          </thead>
          <tbody>
            {configs.map((item) => (
              <tr key={item.id}>
                <td>{item.levelName}</td>
                <td>
                  <Form.Control
                    type="text"
                    min="0"
                    step="0.000000000000000001"
                    value={
                      editValues[item.id] !== undefined
                        ? editValues[item.id]
                        : item.amountPOL
                    }
                    onChange={(e) =>
                      handleInput(item.id, e.target.value)
                    }
                    style={{ maxWidth: 180 }}
                  />
                </td>
                <td>
                  <Button
                    variant="success"
                    size="sm"
                    style={{ minWidth: 80 }}
                    disabled={savingId === item.id}
                    onClick={() => handleSave(item.id)}
                  >
                    {savingId === item.id ? "Menyimpan..." : "Simpan"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

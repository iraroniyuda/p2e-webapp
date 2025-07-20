"use client";

import {
  getAdminCircuitOwnerPackages,
  updateCircuitOwnerPackage,
} from "@/services/apiClient";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Form,
  Spinner,
  Table
} from "react-bootstrap";

export default function EditCircuitPackageTab() {
  const [packages, setPackages] = useState([]);
  const [edited, setEdited] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getAdminCircuitOwnerPackages();
      setPackages(res);
    } catch (err) {
      console.error("❌ Gagal ambil paket:", err);
      setError("Gagal memuat data paket.");
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
    const payload = edited[id];
    if (!payload) return;

    setSavingId(id);
    setError("");
    setSuccess("");

    try {
      await updateCircuitOwnerPackage(id, {
        ...payload,
      });
      setSuccess("Berhasil menyimpan perubahan.");
      setEdited((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      await fetchData();
    } catch (err) {
      console.error("❌ Gagal simpan:", err);
      setError("Gagal menyimpan perubahan.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <h4 className="mb-3">Konfigurasi Paket Circuit Owner</h4>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Table striped bordered hover responsive variant="dark">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Harga SBP</th>
              <th>Cashback SBP</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => (
              <tr key={pkg.id}>
                <td>{pkg.name}</td>
                <td>
                  <Form.Control
                    type="text"
                    defaultValue={pkg.priceSBP}
                    onChange={(e) =>
                      handleChange(pkg.id, "priceSBP", e.target.value)
                    }
                  />
                </td>
                <td>
                  <Form.Control
                    type="text"
                    defaultValue={pkg.cashbackSBP}
                    onChange={(e) =>
                      handleChange(pkg.id, "cashbackSBP", e.target.value)
                    }
                  />
                </td>
                <td>
                  <Form.Check
                    type="checkbox"
                    defaultChecked={pkg.isActive}
                    onChange={(e) =>
                      handleChange(pkg.id, "isActive", e.target.checked)
                    }
                  />
                </td>
                <td>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleSave(pkg.id)}
                    disabled={savingId === pkg.id}
                  >
                    {savingId === pkg.id ? "Menyimpan..." : "Simpan"}
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

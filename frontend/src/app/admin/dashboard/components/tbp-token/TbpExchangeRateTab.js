"use client";

import { getTbpToRupiahRates, setTbpToRupiahRate } from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Alert, Button, Form, Table } from "react-bootstrap";

export default function TbpExchangeRateTab() {
  const [rates, setRates] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const RATE_TYPES = [
    { key: "user_to_company", label: "User → Perusahaan" },
    { key: "user_to_exchanger", label: "User → Exchanger" },
    { key: "exchanger_to_company", label: "Exchanger → Perusahaan" },
  ];

  useEffect(() => {
    getTbpToRupiahRates().then((data) => {
      const formatted = {};
      data.forEach((item) => {
        formatted[item.type] = item.rate;
      });
      setRates(formatted);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      for (const type of RATE_TYPES) {
        const rate = parseInt(rates[type.key]);
        if (!rate || rate <= 0) throw new Error(`Rate invalid: ${type.label}`);
        await setTbpToRupiahRate(type.key, rate);
      }
      setMessage("✅ Semua rate berhasil disimpan.");
    } catch (err) {
      setMessage("❌ Gagal simpan: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="text-white">
      <h4 className="mb-4">Atur Harga Tukar TBP ke Rupiah</h4>

      <Table variant="dark" bordered>
        <thead>
          <tr>
            <th>Jenis Penukaran</th>
            <th>Rate (Rupiah per 1 TBP)</th>
          </tr>
        </thead>
        <tbody>
          {RATE_TYPES.map((type) => (
            <tr key={type.key}>
              <td>{type.label}</td>
              <td>
                <Form.Control
                  type="number"
                  value={rates[type.key] || ""}
                  onChange={(e) =>
                    setRates({ ...rates, [type.key]: e.target.value })
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Button variant="success" onClick={handleSave} disabled={saving}>
        {saving ? "Menyimpan..." : "Simpan Semua"
        }
      </Button>

      {message && (
        <Alert
          className="mt-3"
          variant={message.startsWith("✅") ? "success" : "danger"}
        >
          {message}
        </Alert>
      )}
    </div>
  );
}

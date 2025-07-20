"use client";

import {
  getManualTopupConfig,
  updateManualTopupConfig,
} from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, FormControl, Spinner, Table } from "react-bootstrap";

const currencyLabels = ["Rp", "SBP", "RACE", "TBP"];
const fieldMap = {
  Rp: "Rupiah",
  SBP: "SBP",
  RACE: "RACE",
  TBP: "TBP",
};

const relationLabels = {
  "company→user_exchanger": "Company → User Exchanger",
  "company→user_regular": "Company → User Biasa",
  "user_exchanger→user_regular": "User Exchanger → User Biasa",
};

const formatRupiah = (value) =>
  value === null || value === undefined || isNaN(value)
    ? ""
    : new Intl.NumberFormat("id-ID").format(value);

const parseInput = (value) =>
  parseInt(value.replace(/\./g, "").replace(/[^0-9]/g, "")) || 0;

const getDisplayValue = (value) => (value ? formatRupiah(value) : "");

export default function ManualTopupConfigTab() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await getManualTopupConfig(); // ⬅️ returns array
      setConfigs(res);
    } catch (err) {
      console.error("❌ Gagal mengambil konfigurasi manual topup:", err);
      alert("Gagal mengambil data.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (configId, fieldPrefix, rawValue, label) => {
    const parsed = parseInput(rawValue);
    const fieldName = `${fieldPrefix}${fieldMap[label]}`;
    setConfigs((prev) =>
      prev.map((cfg) =>
        cfg.id === configId ? { ...cfg, [fieldName]: parsed } : cfg
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        configs.map((cfg) => updateManualTopupConfig(cfg.id, cfg))
      );
      alert("✅ Semua konfigurasi berhasil disimpan");
    } catch (err) {
      console.error("❌ Gagal menyimpan:", err);
      alert("Gagal menyimpan konfigurasi.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center text-white py-6">
        <Spinner animation="border" variant="light" />
        <div className="mt-2">Memuat konfigurasi...</div>
      </div>
    );
  }

  return (
    <div className="text-white">
      <h2 className="text-xl font-bold mb-4">Konfigurasi Manual Top-Up</h2>

      {configs.map((cfg) => {
        const relationKey = `${cfg.fromType}→${cfg.toType}`;
        return (
          <div key={cfg.id} className="mb-5">
            <h5 className="mb-2">{relationLabels[relationKey] || relationKey}</h5>
            <Table striped bordered hover responsive variant="dark">
              <thead>
                <tr>
                  <th>Currency</th>
                  <th>Harga</th>
                  <th>Didapat</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {currencyLabels.map((label) => (
                  <tr key={label}>
                    <td className="align-middle">{label}</td>

                    {/* Harga */}
                    <td>
                      <FormControl
                        type="text"
                        placeholder="Harga"
                        value={getDisplayValue(cfg[`price${fieldMap[label]}`])}
                        onChange={(e) =>
                          handleChange(cfg.id, "price", e.target.value, label)
                        }
                        onFocus={(e) => e.target.select()}
                      />
                    </td>

                    {/* Didapat */}
                    <td>
                      {label !== "Rp" ? (
                        <FormControl
                          type="text"
                          placeholder="Didapat"
                          value={getDisplayValue(cfg[`obtained${fieldMap[label]}`])}
                          onChange={(e) =>
                            handleChange(cfg.id, "obtained", e.target.value, label)
                          }
                          onFocus={(e) => e.target.select()}
                        />
                      ) : (
                        <div className="text-center text-muted">-</div>
                      )}
                    </td>

                    {/* Value */}
                    <td>
                      <FormControl
                        type="text"
                        placeholder="Value"
                        value={getDisplayValue(cfg[`value${fieldMap[label]}`])}
                        onChange={(e) =>
                          handleChange(cfg.id, "value", e.target.value, label)
                        }
                        onFocus={(e) => e.target.select()}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        );
      })}

      <div className="text-end mt-3">
        <Button
          variant="success"
          onClick={handleSave}
          disabled={saving}
          className="px-4"
        >
          {saving ? "Menyimpan..." : "Simpan Semua"}
        </Button>
      </div>
    </div>
  );
}

"use client";

import {
  getAdminTopupPackages,
  updateAdminTopupPackage,
} from "@/services/apiClient";
import React, { useEffect, useState } from "react";
import { Button, FormControl, Spinner, Table } from "react-bootstrap";

const currencyLabels = ["Rp", "SBP", "RACE", "TBP"];

// 💡 Mapping label ke nama field DB
const fieldMap = {
  Rp: "Rupiah",
  SBP: "SBP",
  RACE: "RACE",
  TBP: "TBP",
};

// ✅ Format ribuan
const formatRupiah = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "";
  return new Intl.NumberFormat("id-ID").format(value);
};

// ✅ Hapus titik dan non-digit
const parseInput = (value) =>
  parseInt(value.replace(/\./g, "").replace(/[^0-9]/g, "")) || 0;

// ✅ Dapatkan string display
const getDisplayValue = (value) => {
  return value ? formatRupiah(value) : "";
};

export default function TopupPackageTab() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await getAdminTopupPackages();
      setPackages(res);
    } catch (err) {
      console.error("❌ Gagal mengambil paket:", err);
      alert("Gagal mengambil paket.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index, fieldPrefix, rawValue, label) => {
    const parsed = parseInput(rawValue);
    const updated = [...packages];
    const fieldName = `${fieldPrefix}${fieldMap[label]}`;
    updated[index][fieldName] = parsed;
    setPackages(updated);
  };

  const handleTextChange = (index, field, value) => {
    const updated = [...packages];
    updated[index][field] = value;
    setPackages(updated);
  };

  const handleSave = async (pkg, index) => {
    setSavingId(pkg.id);

    const payload = {
      title: pkg.title,
      priceRupiah: pkg.priceRupiah,
      priceSBP: pkg.priceSBP,
      priceRACE: pkg.priceRACE,
      priceTBP: pkg.priceTBP,
      obtainedSBP: pkg.obtainedSBP,
      obtainedRACE: pkg.obtainedRACE,
      obtainedTBP: pkg.obtainedTBP,
      valueRupiah: pkg.valueRupiah,
      valueSBP: pkg.valueSBP,
      valueRACE: pkg.valueRACE,
      valueTBP: pkg.valueTBP,
      bonusDescription: pkg.bonusDescription || "",
      soldBy: pkg.soldBy,
      exchangerId: pkg.exchangerId,
    };

    console.log("📦 Saving package:", payload);

    try {
      await updateAdminTopupPackage(pkg.id, payload);
      alert("✅ Paket berhasil diperbarui");
    } catch (err) {
      console.error("❌ Gagal menyimpan:", err);
      alert("Gagal menyimpan paket.");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center text-white py-6">
        <Spinner animation="border" variant="light" />
        <div className="mt-2">Memuat paket...</div>
      </div>
    );
  }

  return (
    <div className="text-white">
      <h2 className="text-xl font-bold mb-4">Kelola Paket Top-Up</h2>
      <Table striped bordered hover responsive variant="dark">
        <thead>
          <tr>
            <th>Paket</th>
            <th>Currency</th>
            <th>Harga</th>
            <th>Didapat</th>
            <th>Value</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {packages.map((pkg, index) => (
            <React.Fragment key={pkg.id}>
              {currencyLabels.map((label, rowIndex) => (
                <tr key={`${pkg.id}-${label}`}>
                  {rowIndex === 0 && (
                    <td rowSpan={4} className="align-middle fw-bold">
                      {pkg.title}
                    </td>
                  )}

                  <td className="align-middle">{label}</td>

                  {/* Harga */}
                  <td>
                    <FormControl
                      type="text"
                      placeholder="Harga"
                      value={getDisplayValue(pkg[`price${fieldMap[label]}`])}
                      onChange={(e) =>
                        handleChange(index, "price", e.target.value, label)
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
                        value={getDisplayValue(pkg[`obtained${fieldMap[label]}`])}
                        onChange={(e) =>
                          handleChange(index, "obtained", e.target.value, label)
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
                      value={getDisplayValue(pkg[`value${fieldMap[label]}`])}
                      onChange={(e) =>
                        handleChange(index, "value", e.target.value, label)
                      }
                      onFocus={(e) => e.target.select()}
                    />
                  </td>

                  {/* Aksi */}
                  {rowIndex === 0 && (
                    <td rowSpan={4}>
                      <div className="d-flex flex-column h-100 justify-between">
                        <FormControl
                          as="textarea"
                          rows={3}
                          className="mb-2"
                          placeholder="Deskripsi Bonus"
                          value={pkg.bonusDescription || ""}
                          onChange={(e) =>
                            handleTextChange(index, "bonusDescription", e.target.value)
                          }
                        />
                        <Button
                          variant="success"
                          size="sm"
                          className="w-100 mt-auto"
                          onClick={() => handleSave(pkg, index)}
                          disabled={savingId === pkg.id}
                        >
                          {savingId === pkg.id ? "Menyimpan..." : "Simpan"}
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

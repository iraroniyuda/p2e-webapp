"use client";
import apiClient from "@/services/apiClient";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Field configuration
const textFields = [
  { key: "full_name", label: "Full Name" },
  { key: "nik_number", label: "NIK Number" },
  { key: "date_of_birth", label: "Date of Birth" },
  { key: "address", label: "Address" },
  { key: "phone_number", label: "Phone Number" },
  { key: "wallet_address", label: "Wallet Address" },
  { key: "bank_account_number", label: "Bank Account Number" },
  { key: "bank_name", label: "Bank Name" },
  { key: "account_holder_name", label: "Account Holder Name" },
];

// Helper: Only send fields that have values (not empty string or null)
function buildFormData(data) {
  const fd = new FormData();
  Object.entries(data).forEach(([key, val]) => {
    if (
      val !== undefined &&
      val !== null &&
      val !== "" &&
      !(typeof val === "object" && val instanceof File && val.size === 0)
    ) {
      fd.append(key, val);
    }
  });
  return fd;
}

export default function KycUpdateForm({ formData, setFormData }) {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form value change handler
  function handleFieldChange(e) {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files && files.length > 0 ? files[0] : value,
    }));
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = buildFormData(formData);

      // Optional: prevent empty update
      if ([...payload.keys()].length === 0) {
        setError("❌ Tidak ada data yang diubah.");
        setLoading(false);
        return;
      }

      await apiClient.post("/kyc/update", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ KYC berhasil diperbarui.");
      router.push("/dashboard");
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.message ||
          "Gagal update KYC, coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleUpdate} autoComplete="off">
      {error && <div className="alert alert-danger">{error}</div>}
      <h5 className="mt-4 text-white">Update KYC Data</h5>

      {textFields.map(({ key, label }) => (
        <div key={key} className="mb-3 text-white">
          <label className="form-label">{label}</label>
          <input
            type="text"
            name={key}
            value={formData[key] || ""}
            className="form-control"
            onChange={handleFieldChange}
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      ))}
      <button
        className="btn btn-secondary w-100"
        disabled={loading}
        type="submit"
      >
        {loading ? "Updating..." : "Update Info KYC"}
      </button>
    </form>
  );
}

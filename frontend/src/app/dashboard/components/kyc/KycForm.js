"use client";
import { submitKycData } from "@/services/apiClient";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function KycForm({ formData, setFormData }) {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validasi minimal
  const validateFields = () => {
    if (!formData.full_name || !formData.nik_number) {
      setError("❌ Full name dan NIK wajib diisi.");
      return false;
    }
    return true;
  };

  // Tidak ada lagi file, pure FormData dari object formData
  const prepareFormData = () => {
    const formDataToSubmit = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (val) formDataToSubmit.append(key, val);
    });
    return formDataToSubmit;
  };

  const handleKycSubmit = async () => {
    if (!validateFields()) return;

    setLoading(true);
    setError(null);

    const formDataToSubmit = prepareFormData();

    try {
      const res = await submitKycData(formDataToSubmit);

      if (res.success) {
        alert("✅ KYC submitted successfully!");
        router.push("/dashboard");
      } else {
        setError(res.error || "Failed to submit KYC");
      }
    } catch (err) {
      setError("❌ Error submitting KYC.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kyc-form-container">
      {error && <div className="alert alert-danger">{error}</div>}

      <hr />

      <h5 className="text-white">Informasi KTP</h5>
      {["full_name", "nik_number", "date_of_birth", "address", "phone_number", "wallet_address"].map((field) => (
        <div key={field} className="mb-3 text-white">
          <label className="form-label">{field.replace(/_/g, " ").toUpperCase()}</label>
          <input
            type="text"
            name={field}
            value={formData[field] || ""}
            className="form-control"
            onChange={handleFormChange}
          />
        </div>
      ))}

      <h5 className="text-white">Informasi Bank</h5>
      {["bank_name", "account_holder_name", "bank_account_number"].map((field) => (
        <div key={field} className="mb-3 text-white">
          <label className="form-label">{field.replace(/_/g, " ").toUpperCase()}</label>
          <input
            type="text"
            name={field}
            value={formData[field] || ""}
            className="form-control"
            onChange={handleFormChange}
          />
        </div>
      ))}

      <button className="btn btn-primary w-100" disabled={loading} onClick={handleKycSubmit}>
        {loading ? "Submitting..." : "Submit KYC"}
      </button>
    </div>
  );
}

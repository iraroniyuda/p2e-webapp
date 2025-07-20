"use client";

import { useAuth } from "@/contexts/AuthContext";
import { getKycStatus } from "@/services/apiClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import KycForm from "../components/kyc/KycForm";
import KycUpdateForm from "../components/kyc/KycUpdateForm";
import Sidebar from "../components/Sidebar";

export default function KycPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [kycStatus, setKycStatus] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    nik_number: "",
    date_of_birth: "",
    address: "",
    phone_number: "",
    wallet_address: "",
    bank_account_number: "",
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [marginLeft, setMarginLeft] = useState("0px");

  useEffect(() => {
    const handleResize = () => {
      setMarginLeft(window.innerWidth >= 768 ? "220px" : "0px");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    getKycStatus()
      .then((res) => {
        setKycStatus(res.status ?? "NONE");
        if (res.data) {
          setFormData((prev) => ({ ...prev, ...res.data }));
        }
      })
      .catch((err) => {
        console.warn("❌ Failed to fetch KYC status:", err);
        setKycStatus("NONE");
      });
  }, []);

  if (!user || kycStatus === null) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="d-flex position-relative"
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/images/bg-dashboard.png')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div
        className="flex-grow-1 p-4"
        style={{
          marginLeft,
          transition: "margin-left 0.3s ease",
        }}
      >
        {/* Tombol toggle hanya tampil di mobile */}
        <button
          className="btn btn-primary d-md-none mb-3"
          onClick={() => setSidebarOpen(true)}
        >
          ☰ Menu
        </button>

        <div className="container" style={{ maxWidth: 600 }}>
          <h2 className="mb-4 text-white">KYC Verification</h2>

          {kycStatus === "NONE" && (
            <KycForm formData={formData} setFormData={setFormData} />
          )}

          {(kycStatus === "PENDING" || kycStatus === "REJECTED" || kycStatus === "APPROVED") && (
            <KycUpdateForm formData={formData} setFormData={setFormData} />
          )}
        </div>
      </div>
    </div>
  );
}

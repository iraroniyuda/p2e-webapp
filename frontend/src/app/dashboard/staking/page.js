"use client";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/services/apiClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function StakingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [marginLeft, setMarginLeft] = useState("0px");
  const [kycApproved, setKycApproved] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setMarginLeft(window.innerWidth >= 768 ? "220px" : "0px");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchKycStatus = async () => {
      try {
        const res = await apiClient.get("/kyc/status");
        setKycApproved(res.data.status === "APPROVED");
        if (res.data.status !== "APPROVED") {
          router.replace("/dashboard");
        }
      } catch {
        setKycApproved(false);
        router.replace("/dashboard");
      }
    };
    fetchKycStatus();
  }, [user, router]);

  // =========================
  // COMMENT OUT SEMUA RENDER
  // =========================
  /*
  if (!user || kycApproved === null) {
    // Loading spinner
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  if (!kycApproved) return null;

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
        <button
          className="btn btn-primary d-md-none mb-3"
          onClick={() => setSidebarOpen(true)}
        >
          ☰ Menu
        </button>
        <StakingSection />
      </div>
    </div>
  );
  */

  // Halaman benar-benar kosong
  return null;
}

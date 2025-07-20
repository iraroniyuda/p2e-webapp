"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import AdminSidebar from "../components/AdminSidebar";
import SbpSourceRuleTab from "../components/sbp/SbpSourceRuleTab";

export default function SbpSourceRulePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("aturan");

  // ❌ Redirect jika bukan admin
  if (!loading && (!user || user.role !== "admin")) {
    if (typeof window !== "undefined") {
      window.location.href = "/signin";
    }
    return null;
  }

  // ⏳ Spinner saat loading
  if (loading || !user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "aturan":
        return <SbpSourceRuleTab />;
      default:
        return <SbpSourceRuleTab />;
    }
  };

  return (
    <Container
      fluid
      className="d-flex"
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/images/bg-dashboard.png')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <AdminSidebar />

      <div className="flex-grow-1 p-4 text-white">
        <h1 className="text-2xl font-bold mb-4">Aturan Sumber SBP</h1>

        {/* ✅ Navigasi Tab */}
        <div className="flex space-x-4 mb-4">
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "aturan"
                ? "bg-blue-600 text-white"
                : "bg-gray-300 text-black"
            }`}
            onClick={() => setActiveTab("aturan")}
          >
            Daftar Aturan
          </button>
        </div>

        {/* ✅ Isi Konten Tab */}
        <div className="mt-4">{renderContent()}</div>
      </div>
    </Container>
  );
}

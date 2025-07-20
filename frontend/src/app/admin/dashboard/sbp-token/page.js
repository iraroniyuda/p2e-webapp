"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";

import AdminSidebar from "../components/AdminSidebar";
import SBPAllocationTab from "../components/sbp-token/SBPAllocationTab";
import SbpSourceRuleTab from "../components/sbp-token/SbpSourceRuleTab";
import SBPTokenHistoryTab from "../components/sbp-token/SBPTokenHistoryTab";
import SBPTokenTab from "../components/sbp-token/SBPTokenTab";
import SbpToTbpConversionTab from "../components/sbp-token/SbpToTbpConversionTab";
import SBPTransferTab from "../components/sbp-token/SBPTransferTab";
import StakingConfigTab from "../components/sbp-token/StakingConfigTab";

export default function SBPManagementPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("sbp");
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

  if (!loading && (!user || user.role !== "admin")) {
    if (typeof window !== "undefined") {
      window.location.href = "/signin";
    }
    return null;
  }

  if (loading || !user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "sbp":
        return <SBPTokenTab />;
      case "sbp-allocation":
        return <SBPAllocationTab />;
      case "sbp-transfer":
        return <SBPTransferTab />;
      case "staking-config":
        return <StakingConfigTab />;
      case "sbp-history":
        return <SBPTokenHistoryTab />;
      case "sbp-source-rule":
        return <SbpSourceRuleTab />;
      case "sbp-to-tbp":
        return <SbpToTbpConversionTab />;
      default:
        return <SBPTokenTab />;
    }
  };

  const getTabStyle = (key) => ({
    backgroundColor: activeTab === key ? "#28a745" : "white",
    color: activeTab === key ? "white" : "black",
    borderColor: "#ced4da",
  });

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
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div
        className="flex-grow-1 p-4 text-white"
        style={{ marginLeft, transition: "margin-left 0.3s ease" }}
      >
        {/* ☰ Menu toggle di mobile */}
        <button
          className="btn btn-primary d-md-none mb-3"
          onClick={() => setSidebarOpen(true)}
        >
          ☰ Menu
        </button>

        <h1 className="text-2xl font-bold mb-4">Manajemen SBP</h1>

        <div className="flex flex-wrap gap-3 mb-4">
          <button
            className="px-4 py-2 rounded border"
            style={getTabStyle("sbp")}
            onClick={() => setActiveTab("sbp")}
          >
            SBP
          </button>
          <button
            className="px-4 py-2 rounded border"
            style={getTabStyle("sbp-allocation")}
            onClick={() => setActiveTab("sbp-allocation")}
          >
            SBP Allocation
          </button>
          <button
            className="px-4 py-2 rounded border"
            style={getTabStyle("sbp-transfer")}
            onClick={() => setActiveTab("sbp-transfer")}
          >
            Transfer S-BP
          </button>
          <button
            className="px-4 py-2 rounded border"
            style={getTabStyle("staking-config")}
            onClick={() => setActiveTab("staking-config")}
          >
            Konfigurasi Staking
          </button>
          <button
            className="px-4 py-2 rounded border"
            style={getTabStyle("sbp-history")}
            onClick={() => setActiveTab("sbp-history")}
          >
            Riwayat SBP
          </button>
          <button
            className="px-4 py-2 rounded border"
            style={getTabStyle("sbp-source-rule")}
            onClick={() => setActiveTab("sbp-source-rule")}
          >
            Aturan Sumber SBP
          </button>
          <button
            className="px-4 py-2 rounded border"
            style={getTabStyle("sbp-to-tbp")}
            onClick={() => setActiveTab("sbp-to-tbp")}
          >
            Konversi SBP ➝ TBP
          </button>
        </div>

        <div>{renderContent()}</div>
      </div>
    </Container>
  );
}

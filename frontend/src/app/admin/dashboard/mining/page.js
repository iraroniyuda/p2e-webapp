"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";

import AdminSidebar from "../components/AdminSidebar";
import MiningConfigTab from "../components/mining/MiningConfigTab";
import MiningStatsTab from "../components/mining/MiningStatsTab";
import MiningUserLogTab from "../components/mining/MiningUserLogTab";

export default function MiningManagementPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("config");
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
    if (typeof window !== "undefined") window.location.href = "/signin";
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
      case "config":
        return <MiningConfigTab />;
      case "stats":
        return <MiningStatsTab />;
      case "logs":
        return <MiningUserLogTab />;
      default:
        return null;
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
        {/* Toggle button on small screen */}
        <button
          className="btn btn-primary d-md-none mb-3"
          onClick={() => setSidebarOpen(true)}
        >
          ☰ Menu
        </button>

        <h1 className="mb-4 text-2xl font-bold">Manajemen Mining</h1>

        {/* ✅ Tab Buttons */}
        <div className="flex space-x-4 mb-4">
          <button
            className="px-4 py-2 rounded border"
            style={getTabStyle("config")}
            onClick={() => setActiveTab("config")}
          >
            Konfigurasi Reward
          </button>
          <button
            className="px-4 py-2 rounded border"
            style={getTabStyle("stats")}
            onClick={() => setActiveTab("stats")}
          >
            Statistik Harian
          </button>
          <button
            className="px-4 py-2 rounded border"
            style={getTabStyle("logs")}
            onClick={() => setActiveTab("logs")}
          >
            Log Per User
          </button>
        </div>

        <div>{renderContent()}</div>
      </div>
    </Container>
  );
}

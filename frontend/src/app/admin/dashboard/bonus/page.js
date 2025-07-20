"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import AdminSidebar from "../components/AdminSidebar";
import AdminBonusTab from "../components/bonus/AdminBonusTab";

export default function AdminBonusPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("konfigurasi");
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
      case "konfigurasi":
        return <AdminBonusTab />;
      default:
        return <AdminBonusTab />;
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
        {/* Tombol Toggle Sidebar untuk mobile */}
        <button
          className="btn btn-primary d-md-none mb-3"
          onClick={() => setSidebarOpen(true)}
        >
          ☰ Menu
        </button>

        <h1 className="text-2xl font-bold mb-4">Kelola Bonus</h1>

        {/* Tab Navigasi */}
        <div className="flex space-x-4 mb-4">
          <button
            className="px-4 py-2 rounded border"
            style={getTabStyle("konfigurasi")}
            onClick={() => setActiveTab("konfigurasi")}
          >
            Konfigurasi Bonus
          </button>
        </div>

        {/* Konten Tab */}
        <div className="mt-4">{renderContent()}</div>
      </div>
    </Container>
  );
}

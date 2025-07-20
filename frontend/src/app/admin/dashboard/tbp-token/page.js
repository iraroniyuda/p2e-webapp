"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Container, Spinner, Tab, Tabs } from "react-bootstrap";

import AdminSidebar from "../components/AdminSidebar";
import TBPWalletTab from "../components/tbp-token/TBPWalletTab";
import TbpExchangeRateTab from "../components/tbp-token/TbpExchangeRateTab";

export default function TokenManagementPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("tbp-wallet");
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
        {/* Mobile menu toggle */}
        <button
          className="btn btn-primary d-md-none mb-3"
          onClick={() => setSidebarOpen(true)}
        >
          ☰ Menu
        </button>

        <h1 className="mb-4">Manajemen TBP</h1>

        <Tabs
          id="token-tabs"
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4"
          variant="pills"
        >
          <Tab eventKey="tbp-wallet" title="TBP-Wallet">
            <TBPWalletTab />
          </Tab>

          <Tab eventKey="tbp-exchange-rate" title="Rasio Tukar TBP-Rupiah">
            <TbpExchangeRateTab />
          </Tab>
        </Tabs>
      </div>
    </Container>
  );
}

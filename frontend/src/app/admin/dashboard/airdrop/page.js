"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Container, Spinner, Tab, Tabs } from "react-bootstrap";
import AdminSidebar from "../components/AdminSidebar";
import AdminAirdropListTab from "../components/airdrop/AdminAirdropListTab";
import AdminDailyAirdropTab from "../components/airdrop/AdminDailyAirdropTab";

export default function AdminAirdropPage() {
  const { user, loading } = useAuth();
  const [activeKey, setActiveKey] = useState("daily");
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
        <button
          className="btn btn-primary d-md-none mb-3"
          onClick={() => setSidebarOpen(true)}
        >
          ☰ Menu
        </button>

        <h1 className="text-2xl font-bold mb-4">🎁 Manajemen Airdrop</h1>

        <Tabs
          id="airdrop-tabs"
          activeKey={activeKey}
          onSelect={(k) => setActiveKey(k)}
          className="mb-3"
        >
          <Tab eventKey="daily" title="📅 Airdrop Harian">
            <AdminDailyAirdropTab />
          </Tab>

          <Tab eventKey="list" title="📋 Airdrop Terjadwal">
            <AdminAirdropListTab />
          </Tab>
        </Tabs>
      </div>
    </Container>
  );
}

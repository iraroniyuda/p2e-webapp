"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Container, Spinner, Tab, Tabs } from "react-bootstrap";

import AdminSidebar from "../components/AdminSidebar";
import RACETokenTab from "../components/tokens/RACETokenTab";
import SBPTokenHistoryTab from "../components/tokens/SBPTokenHistoryTab";
import SBPTokenTab from "../components/tokens/SBPTokenTab";
import SBPTransferTab from "../components/tokens/SBPTransferTab";
import TBPTokenTab from "../components/tokens/TBPTokenTab";

export default function TokenManagementPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("tbp");

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
      <AdminSidebar />

      <div className="flex-grow-1 p-4 text-white">
        <h1 className="mb-4">Manajemen Token</h1>

        <Tabs
          id="token-tabs"
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4"
          variant="pills"
        >
          <Tab eventKey="tbp" title="TBP">
            <TBPTokenTab />
          </Tab>
          <Tab eventKey="sbp" title="S-BP">
            <SBPTokenTab />
          </Tab>
          <Tab eventKey="sbp-transfer" title="Transfer S-BP">
            <SBPTransferTab />
          </Tab>
          <Tab eventKey="sbp-history" title="Riwayat SBP">
            <SBPTokenHistoryTab />
          </Tab>
          <Tab eventKey="race" title="RACE">
            <RACETokenTab />
          </Tab>
        </Tabs>
      </div>
    </Container>
  );
}

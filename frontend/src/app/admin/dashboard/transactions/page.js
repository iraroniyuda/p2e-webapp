"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";

import AdminSidebar from "../components/AdminSidebar";
import EditWithdrawConfigTab from "../components/transactions/EditWithdrawConfigTab";
import FixTransactionTab from "../components/transactions/FixTransactionTab";
import ManualTopupConfigTab from "../components/transactions/ManualTopupConfigTab";
import PolClaimConfigTab from "../components/transactions/PolClaimConfigTab";
import PolClaimHistoryTab from "../components/transactions/PolClaimHistoryTab";
import TopupPackageTab from "../components/transactions/TopupPackageTab";
import WithdrawAdminTab from "../components/transactions/WithdrawAdminTab";
import WithdrawalHistoryTab from "../components/transactions/WithdrawalHistoryTab";




export default function AdminTransactionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("package");
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
    case "package":
      return <TopupPackageTab />;
    case "fix-applied":
      return <FixTransactionTab />;
    case "manual-topup":
      return <ManualTopupConfigTab />;
    case "withdraw-config":
      return <EditWithdrawConfigTab />;
    case "withdraw-admin":
      return <WithdrawAdminTab />;
    case "withdrawal-history":
      return <WithdrawalHistoryTab />;
    case "pol-claim-config":         
      return <PolClaimConfigTab />;
    case "pol-claim-history":
    return <PolClaimHistoryTab />;

    default:
      return <TopupPackageTab />;
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
        <button
          className="btn btn-primary d-md-none mb-3"
          onClick={() => setSidebarOpen(true)}
        >
          ☰ Menu
        </button>

        <h1 className="text-2xl font-bold mb-4">Kelola Transaksi Admin</h1>

        <div className="flex flex-wrap gap-3 mb-4">
          <button
            className="px-4 py-2 rounded border"
            style={getTabStyle("package")}
            onClick={() => setActiveTab("package")}
          >
            Paket Top-Up
          </button>
          <button
            className="px-4 py-2 rounded border"
            style={getTabStyle("manual-topup")}
            onClick={() => setActiveTab("manual-topup")}
          >
            Manual Top-Up Config
          </button>
          <button
            className="px-4 py-2 rounded border"
            style={getTabStyle("fix-applied")}
            onClick={() => setActiveTab("fix-applied")}
          >
            Perbaiki Transaksi
          </button>
          <button
            className="px-4 py-2 rounded border"
            style={getTabStyle("withdraw-config")}
            onClick={() => setActiveTab("withdraw-config")}
          >
            Minimal Withdraw
          </button>
          <button
            className="px-4 py-2 rounded border"
            style={getTabStyle("withdraw-admin")}
            onClick={() => setActiveTab("withdraw-admin")}
          >
            Withdraw Admin
          </button>
          <button
            className="px-4 py-2 rounded border"
            style={getTabStyle("withdrawal-history")}
            onClick={() => setActiveTab("withdrawal-history")}
          >
            Riwayat Withdraw
          </button>

          <button
            className="px-4 py-2 rounded border"
            style={getTabStyle("pol-claim-config")}
            onClick={() => setActiveTab("pol-claim-config")}
          >
            Config POL Claim
          </button>
          <button
            className="px-4 py-2 rounded border"
            style={getTabStyle("pol-claim-history")}
            onClick={() => setActiveTab("pol-claim-history")}
          >
            Riwayat Klaim POL
          </button>

        </div>


        <div className="mt-4">{renderContent()}</div>
      </div>
    </Container>
  );
}

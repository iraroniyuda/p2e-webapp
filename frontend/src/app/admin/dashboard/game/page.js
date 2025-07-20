"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";

import AdminSidebar from "../components/AdminSidebar";
import CircuitOwnerTab from "../components/game/CircuitOwnerTab";
import EditCarPriceTab from "../components/game/EditCarPriceTab";
import EditCarRaceRewardTab from "../components/game/EditCarRaceRewardTab";
import EditCircuitPackageTab from "../components/game/EditCircuitPackageTab";
import EditRaceEntryFeeTab from "../components/game/EditRaceEntryFeeTab";
import EditReferralBonusTab from "../components/game/EditReferralBonusTab";


export default function GamePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("circuit-owner");
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
        <Spinner animation="border" />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "circuit-owner":
        return <CircuitOwnerTab />;
      case "edit-car-price":
        return <EditCarPriceTab />;
      case "entry-fee":
        return <EditRaceEntryFeeTab />;
      case "edit-car-reward":
        return <EditCarRaceRewardTab />;
      case "package":
        return <EditCircuitPackageTab />;
      case "referral-bonus":
        return <EditReferralBonusTab />;
      default:
        return null;
    }
  };

  const getTabStyle = (key) => ({
    backgroundColor: activeTab === key ? "#007bff" : "white",
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

        <h1 className="mb-4 text-2xl font-bold">Manajemen Game</h1>

        <div className="flex flex-wrap gap-3 mb-4">
          <button style={getTabStyle("circuit-owner")} onClick={() => setActiveTab("circuit-owner")}>
            Circuit Owner
          </button>
          <button style={getTabStyle("edit-car-price")} onClick={() => setActiveTab("edit-car-price")}>
            Harga Mobil
          </button>
          <button style={getTabStyle("entry-fee")} onClick={() => setActiveTab("entry-fee")}>
            Biaya Entry Balapan
          </button>
          <button style={getTabStyle("edit-car-reward")} onClick={() => setActiveTab("edit-car-reward")}>
            Reward Balapan
          </button>
          <button style={getTabStyle("package")} onClick={() => setActiveTab("package")}>
            Paket Sirkuit
          </button>
          <button style={getTabStyle("referral-bonus")} onClick={() => setActiveTab("referral-bonus")}>
            Referral Bonus
          </button>
        </div>

        <div>{renderContent()}</div>
      </div>
    </Container>
  );
}

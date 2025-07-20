"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";

import Sidebar from "../components/Sidebar";
import ClaimRewardTab from "../components/mining-user/ClaimRewardTab";
import MiningRewardPreviewTab from "../components/mining-user/MiningRewardPreviewTab";
import MyMiningLinkTab from "../components/mining-user/MyMiningLinkTab";

export default function UserMiningPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("link");
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

  if (!loading && !user) {
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
      case "link":
        return <MyMiningLinkTab />;
      case "reward":
        return <MiningRewardPreviewTab />;
      case "claim":
        return <ClaimRewardTab />;
      default:
        return <MyMiningLinkTab />;
    }
  };

  const getTabStyle = (key) => ({
    backgroundColor: activeTab === key ? "#28a745" : "white",
    color: activeTab === key ? "white" : "black",
    borderColor: "#ced4da",
  });

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
        className="flex-grow-1 p-4 text-white"
        style={{
          marginLeft,
          transition: "margin-left 0.3s ease",
        }}
      >
        {/* Tombol toggle sidebar untuk mobile */}
        <button
          className="btn btn-primary d-md-none mb-3"
          onClick={() => setSidebarOpen(true)}
        >
          ☰ Menu
        </button>

        <h1 className="text-2xl font-bold mb-4">Dashboard Mining</h1>

        <div className="d-flex flex-wrap gap-3 mb-4">
          <button
            className="btn border px-4 py-2"
            style={getTabStyle("link")}
            onClick={() => setActiveTab("link")}
          >
            Link Referral Saya
          </button>
          <button
            className="btn border px-4 py-2"
            style={getTabStyle("reward")}
            onClick={() => setActiveTab("reward")}
          >
            Cek Reward
          </button>
          <button
            className="btn border px-4 py-2"
            style={getTabStyle("claim")}
            onClick={() => setActiveTab("claim")}
          >
            Klaim Reward
          </button>
        </div>

        <div className="mt-4">{renderContent()}</div>
      </div>
    </div>
  );
}

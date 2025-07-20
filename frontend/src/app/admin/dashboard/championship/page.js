"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";

import AdminSidebar from "../components/AdminSidebar";
import AdminAssignRoomTab from "../components/championship/AdminAssignRoomTab";
import AdminPromoteByGroupPage from "../components/championship/AdminPromoteByGroupPage";
import ApproveChampionshipTab from "../components/championship/ApproveChampionshipTab";
import FinishChampionshipTab from "../components/championship/FinishChampionshipTab";
import ParticipantApprovalTab from "../components/championship/ParticipantApprovalTab";
import StartPhaseTab from "../components/championship/StartPhaseTab";
import ViewPhaseGroupsTab from "../components/championship/ViewPhaseGroupsTab";
import ViewPhaseParticipantsTab from "../components/championship/ViewPhaseParticipantsTab";


export default function ChampionshipPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("approve-championship");
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
      case "approve-championship":
        return <ApproveChampionshipTab />;
      case "participant-approval":
        return <ParticipantApprovalTab />;
      case "start-phase":
        return <StartPhaseTab />;
      case "view-phase-participants":
        return <ViewPhaseParticipantsTab />;
      case "assign-room":
        return <AdminAssignRoomTab />;
      case "view-groups":
        return <ViewPhaseGroupsTab />;
      case "promote":
        return <AdminPromoteByGroupPage />;        
      case "finish":
        return <FinishChampionshipTab />;
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
        <button
          className="btn btn-primary d-md-none mb-3"
          onClick={() => setSidebarOpen(true)}
        >
          ☰ Menu
        </button>

        <h1 className="mb-4 text-2xl font-bold">Manajemen Championship</h1>

        <div className="flex flex-wrap gap-3 mb-4">
          <button style={getTabStyle("approve-championship")} onClick={() => setActiveTab("approve-championship")}>
            Approve Championship
          </button>
          <button style={getTabStyle("participant-approval")} onClick={() => setActiveTab("participant-approval")}>
            Approve Peserta
          </button>
          <button style={getTabStyle("start-phase")} onClick={() => setActiveTab("start-phase")}>
            Mulai Fase
          </button>
          {/*<button  style={getTabStyle("view-phase-participants")}  onClick={() => setActiveTab("view-phase-participants")}>
            Peserta per Fase
          </button>
          <button style={getTabStyle("view-groups")} onClick={() => setActiveTab("view-groups")}>
            Lihat Grup
          </button> */}          
          <button style={getTabStyle("assign-room")} onClick={() => setActiveTab("assign-room")}>
            Assign Room
          </button>
          <button style={getTabStyle("promote")} onClick={() => setActiveTab("promote")}>
            Promote
          </button>
          <button style={getTabStyle("finish")} onClick={() => setActiveTab("finish")}>
            Selesai Championship
          </button>
        </div>

        <div>{renderContent()}</div>
      </div>
    </Container>
  );
}

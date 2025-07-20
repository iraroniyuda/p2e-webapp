"use client";
import { useAuth } from "@/contexts/AuthContext";
import AnnouncementSection from "../components/AnnouncementSection";
import Sidebar from "../components/Sidebar";

export default function AnnouncementPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="d-flex" 
      style={{ 
        minHeight: "100vh", 
        backgroundImage: "url('/images/bg-dashboard.png')", 
        backgroundSize: "cover", 
        backgroundRepeat: "no-repeat", 
        backgroundPosition: "center" 
      }}
    >
      <Sidebar />
      <div className="flex-grow-1 p-4">
        <AnnouncementSection />
      </div>
    </div>
  );
}

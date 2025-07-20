"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import WithdrawSection from "../components/WithdrawSection";

export default function WithdrawPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [marginLeft, setMarginLeft] = useState("0px");

  useEffect(() => {
    const handleResize = () => {
      setMarginLeft(window.innerWidth >= 768 ? "220px" : "0px");
    };
    handleResize(); // initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        className="flex-grow-1 p-4"
        style={{
          marginLeft,
          transition: "margin-left 0.3s ease",
        }}
      >
        {/* Tombol menu hanya muncul di mobile */}
        <button
          className="btn btn-primary d-md-none mb-3"
          onClick={() => setSidebarOpen(true)}
        >
          ☰ Menu
        </button>

        <WithdrawSection />
      </div>
    </div>
  );
}

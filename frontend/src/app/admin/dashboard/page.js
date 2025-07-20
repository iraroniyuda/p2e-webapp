"use client";

import AdminNavbar from "@/components/layout/AdminNavbar";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import AdminSidebar from "./components/AdminSidebar";

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [marginLeft, setMarginLeft] = useState("0px");

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      if (typeof window !== "undefined") {
        window.location.href = "/signin";
      }
    }
  }, [user, loading]);

  useEffect(() => {
    const handleResize = () => {
      setMarginLeft(window.innerWidth >= 768 ? "220px" : "0px");
    };

    handleResize(); // initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading || !user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
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
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main
        className="flex-grow-1 p-4 overflow-auto"
        style={{
          marginLeft,
          transition: "margin-left 0.3s ease",
        }}
      >
        {/* Tombol toggle sidebar hanya di mobile */}
        <button
          className="btn btn-primary d-md-none mb-3"
          onClick={() => setSidebarOpen(true)}
        >
          ☰ Menu
        </button>

        <AdminNavbar />
        <h2 className="text-white">Selamat datang di Admin Dashboard, {user.username}</h2>
        <p className="text-white">Gunakan sidebar untuk mengakses fitur-fitur manajemen.</p>
      </main>
    </div>
  );
}

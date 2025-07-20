"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Card } from "react-bootstrap";
import AdminSidebar from "../components/AdminSidebar";

export default function UserManagementPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
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
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const goToPage = (path) => {
    router.push(path);
  };

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

        <h1>Manajemen Pengguna</h1>
        <div className="d-flex flex-wrap gap-4 mt-4">
          <Card
            className="p-3 text-black"
            style={{
              width: "300px",
              backdropFilter: "blur(10px)",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
            }}
          >
            <h4>Daftar Pengguna</h4>
            <p>Lihat daftar pengguna, pencarian dan filter.</p>
            <Button
              variant="primary"
              onClick={() => goToPage("/admin/dashboard/users/list")}
            >
              Buka
            </Button>
          </Card>

          <Card
            className="p-3 text-black"
            style={{
              width: "300px",
              backdropFilter: "blur(10px)",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
            }}
          >
            <h4>Approval Pengguna</h4>
            <p>Kelola pengguna yang membutuhkan persetujuan.</p>
            <Button
              variant="primary"
              onClick={() => goToPage("/admin/dashboard/users/approval")}
            >
              Buka
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

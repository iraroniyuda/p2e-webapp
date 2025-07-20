// src/app/admin/dashboard/layout.js
"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "react-bootstrap";
import AdminSidebar from "./components/AdminSidebar";

export default function AdminDashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/signin");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
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
        backgroundPosition: "center",
      }}
    >
      <AdminSidebar />
      <div className="flex-grow-1 p-4 text-white">
        {children}
      </div>
    </div>
  );
}

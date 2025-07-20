"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }) {
  const router = useRouter();
  const { logout } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize(); // initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navigateTo = (path) => {
    router.push(path);
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <div
      className="text-white position-fixed top-0 start-0 vh-100 z-3 d-md-flex flex-column"
      style={{
        width: "220px",
        background: "linear-gradient(to bottom, rgba(0, 123, 255, 0.7), rgba(0, 123, 255, 0.4))",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: "0 0 15px rgba(0, 0, 0, 0.3)",
        transform: isMobile
          ? sidebarOpen
            ? "translateX(0)"
            : "translateX(-100%)"
          : "translateX(0)",
        transition: "transform 0.3s ease-in-out",
      }}
    >
      {/* Tombol close di mobile */}
      {isMobile && (
        <div className="d-flex justify-content-end p-2">
          <button className="btn btn-sm btn-light" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
      )}

      <div className="text-center mb-3">
        <img
          src="/.png"
          alt="Admin Logo"
          style={{ maxWidth: "100px", maxHeight: "80px", objectFit: "contain" }}
        />
      </div>

      <h5 className="text-center mb-3">Admin Dashboard</h5>
      <ul className="nav nav-pills flex-column px-3">
        <li className="nav-item"><button className="nav-link text-white" onClick={() => navigateTo("/admin/dashboard")}>Dashboard Utama</button></li>
        <li className="nav-item"><button className="nav-link text-white" onClick={() => navigateTo("/admin/dashboard/users")}>Manajemen User</button></li>
        <li className="nav-item"><button className="nav-link text-white" onClick={() => navigateTo("/admin/dashboard/referral")}>Referral</button></li>
        <li className="nav-item"><button className="nav-link text-white" onClick={() => navigateTo("/admin/dashboard/tbp-token")}>Manajemen TBP</button></li>
        <li className="nav-item"><button className="nav-link text-white" onClick={() => navigateTo("/admin/dashboard/sbp-token")}>Manajemen SBP</button></li>
        <li className="nav-item"><button className="nav-link text-white" onClick={() => navigateTo("/admin/dashboard/race-token")}>Manajemen RACE</button></li>
        <li className="nav-item"><button className="nav-link text-white" onClick={() => navigateTo("/admin/dashboard/transactions")}>Manajemen Transaksi</button></li>
        <li className="nav-item"><button className="nav-link text-white" onClick={() => navigateTo("/admin/dashboard/exchanger")}>Konfigurasi Exchanger</button></li>
        <li className="nav-item"><button className="nav-link text-white" onClick={() => navigateTo("/admin/dashboard/bonus")}>Konfigurasi Bonus</button></li>
        <li className="nav-item"><button className="nav-link text-white" onClick={() => navigateTo("/admin/dashboard/mining")}>Konfigurasi Mining</button></li>
        <li className="nav-item"><button className="nav-link text-white" onClick={() => navigateTo("/admin/dashboard/airdrop")}>Manajemen Airdrop</button></li>
        <li className="nav-item"><button className="nav-link text-white" onClick={() => navigateTo("/admin/dashboard/game")}>Manajemen Game</button></li>
        <li className="nav-item"><button className="nav-link text-white" onClick={() => navigateTo("/admin/dashboard/championship")}>Championship</button></li>
        <li className="nav-item mt-4"><button className="btn btn-danger w-100" onClick={logout}>Logout</button></li>
      </ul>
    </div>
  );
}

"use client";

import { useAuth } from "@/contexts/AuthContext";
import apiClient, {
  claimDailyAirdrop,
  getDailyAirdropStatus,
} from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Card, Spinner } from "react-bootstrap";
import Sidebar from "../components/Sidebar";

export default function UserAirdropPage() {
  const { user } = useAuth();
  const [airdrops, setAirdrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [marginLeft, setMarginLeft] = useState("0px");

  const [dailyAirdrop, setDailyAirdrop] = useState(null);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setMarginLeft(window.innerWidth >= 768 ? "220px" : "0px");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchAirdrops();
    fetchDailyAirdrop();
  }, []);

  const fetchAirdrops = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/airdrop/active");
      setAirdrops(res.data);
    } catch (err) {
      console.error("❌ Gagal fetch airdrop:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyAirdrop = async () => {
    try {
      const res = await getDailyAirdropStatus();
      setDailyAirdrop(res);
    } catch (err) {
      console.error("❌ Gagal cek status airdrop harian:", err);
    }
  };

  const joinAirdrop = async (id) => {
    try {
      await apiClient.post(`/airdrop/${id}/join`);
      fetchAirdrops();
    } catch (err) {
      console.error("❌ Gagal join airdrop:", err);
    }
  };

  const handleClaimDaily = async () => {
    try {
      setClaiming(true);
      const res = await claimDailyAirdrop();
      alert(res.message || "✅ Klaim berhasil");
      fetchDailyAirdrop();
    } catch (err) {
      alert(err?.response?.data?.error || "❌ Gagal klaim airdrop harian");
    } finally {
      setClaiming(false);
    }
  };

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
        className="flex-grow-1 p-4 text-white"
        style={{
          marginLeft,
          transition: "margin-left 0.3s ease",
        }}
      >
        <button
          className="btn btn-primary d-md-none mb-3"
          onClick={() => setSidebarOpen(true)}
        >
          ☰ Menu
        </button>

        <h3>🎁 Airdrop Aktif</h3>

        {loading ? (
          <Spinner animation="border" />
        ) : airdrops.length === 0 ? (
          <p>Tidak ada airdrop yang tersedia.</p>
        ) : (
          airdrops.map((item) => (
            <Card key={item.id} className="mb-3">
              <Card.Body>
                <Card.Title>{item.title}</Card.Title>
                <Card.Text>{item.description}</Card.Text>
                <p><strong>Jumlah/Orang:</strong> {item.amountPerUser} SBP</p>
                <p><strong>Deadline:</strong> {new Date(item.deadline).toLocaleString()}</p>
                <p><strong>Status:</strong> {item.participationStatus || "❌ Belum daftar"}</p>
                {!item.participationStatus && (
                  <Button size="sm" onClick={() => joinAirdrop(item.id)}>
                    🚀 Join Airdrop
                  </Button>
                )}
              </Card.Body>
            </Card>
          ))
        )}

        <h3 className="mt-5">📅 Airdrop Harian</h3>

        {dailyAirdrop ? (
          <Card className="bg-dark text-white mt-3">
            <Card.Body>
              <p><strong>Login Streak:</strong> {dailyAirdrop.loginStreak} hari</p>
              <p><strong>Target Login:</strong> {dailyAirdrop.requiredLoginDays} hari</p>
              <p><strong>Total Transaksi:</strong> Rp {Number(dailyAirdrop.totalTransactionAmount || 0).toLocaleString("id-ID")}</p>
              <p><strong>Minimal Transaksi:</strong> Rp {Number(dailyAirdrop.requiredMinimum || 0).toLocaleString("id-ID")}</p>
              <p><strong>Reward Siap Diklaim:</strong> {dailyAirdrop.rewardAmount} SBP</p>

              {dailyAirdrop.eligible ? (
                <Button onClick={handleClaimDaily} disabled={claiming}>
                  {claiming ? "Mengklaim..." : "🎁 Klaim Sekarang"}
                </Button>
              ) : (
                <p className="text-warning mt-3">
                  ❌ Belum memenuhi syarat klaim
                </p>
              )}
            </Card.Body>
          </Card>
        ) : (
          <p className="text-white mt-3">Memuat status airdrop harian...</p>
        )}
      </div>
    </div>
  );
}

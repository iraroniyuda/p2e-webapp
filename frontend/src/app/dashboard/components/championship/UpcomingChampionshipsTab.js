"use client";

import { getUpcomingChampionships, registerToChampionship } from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";

export default function UpcomingChampionshipsTab() {
  const [championships, setChampionships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getUpcomingChampionships();
      setChampionships(data);
    } catch (err) {
      console.error("❌ Gagal ambil championship upcoming", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (championshipId) => {
    try {
      setRegisteringId(championshipId);
      await registerToChampionship({ championshipId });
      alert("✅ Berhasil mendaftar!");
      fetchData(); // refresh
    } catch (err) {
      alert("❌ Gagal mendaftar: " + err?.response?.data?.error || "Unknown error");
    } finally {
      setRegisteringId(null);
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4 text-light">Upcoming Championships</h3>
      {championships.length === 0 ? (
        <p className="text-white">Belum ada turnamen yang akan datang.</p>
      ) : (
        <div className="space-y-4">
          {championships.map((ch) => (
            <div key={ch.id} className="border p-4 rounded-lg shadow-sm bg-white">
              <div className="font-bold text-lg">{ch.title}</div>
              <div className="text-sm text-gray-600">
                Jadwal: {new Date(ch.request?.scheduledAt).toLocaleString()}
              </div>
              <div className="text-sm text-gray-700">{ch.request?.description}</div>
              <div className="mt-2">
                <Button
                  size="sm"
                  onClick={() => handleRegister(ch.id)}
                  disabled={registeringId === ch.id}
                >
                  {registeringId === ch.id ? "Mendaftar..." : "Daftar Sekarang"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

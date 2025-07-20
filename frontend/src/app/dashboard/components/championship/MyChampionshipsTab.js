"use client";

import { getMyChampionships } from "@/services/apiClient"; // kamu akan tambahkan fungsi ini nanti
import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";

export default function MyChampionshipsTab() {
  const [championships, setChampionships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getMyChampionships();
      setChampionships(data);
    } catch (err) {
      console.error("❌ Gagal mengambil data championship", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4 text-light">Your Championships</h3>

      {championships.length === 0 ? (
        <p className="text-white">Belum ada championship</p>
      ) : (
        <div className="space-y-4">
          {championships.map((ch) => (
            <div
              key={ch.id}
              className="border rounded-lg p-4 shadow-sm bg-white"
            >
              <div className="font-bold text-lg">{ch.title}</div>
              <div className="text-sm text-gray-600">
                Jadwal: {new Date(ch.request?.scheduledAt).toLocaleString()}
              </div>
              <div className="text-sm">
                Status: <span className="font-semibold">{ch.status}</span>
              </div>
              <div className="mt-2">
                <p>{ch.request?.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

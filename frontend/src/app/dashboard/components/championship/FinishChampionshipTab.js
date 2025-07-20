"use client";

import {
  completeChampionshipFinal,
  getMyChampionships,
} from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";

export default function FinishChampionshipTab() {
  const [championships, setChampionships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [doneIds, setDoneIds] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getMyChampionships();
      const unfinished = data.filter(
        (ch) => ch.status !== "finished" && ch.status !== "pending"
      );
      setChampionships(unfinished);
    } catch (err) {
      console.error("❌ Gagal ambil championship", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async (championshipId) => {
    try {
      setProcessingId(championshipId);
      const result = await completeChampionshipFinal(championshipId);
      alert("🏁 Championship selesai!\n" + result.juara.map((j) => `Juara ${j.position}: ${j.userId}`).join("\n"));
      setDoneIds((prev) => [...prev, championshipId]);
    } catch (err) {
      console.error("❌ Gagal menyelesaikan championship", err);
      alert("Gagal: " + (err?.response?.data?.error || "Unknown error"));
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4 text-light">Selesaikan Championship</h3>
      {championships.length === 0 ? (
        <p className="text-muted">Tidak ada championship yang aktif.</p>
      ) : (
        <div className="space-y-4">
          {championships.map((ch) => (
            <div key={ch.id} className="p-4 bg-white shadow rounded text-black">
              <div className="font-bold text-lg mb-1">{ch.title}</div>
              <div className="text-sm mb-2">
                Jadwal: {new Date(ch.request?.scheduledAt).toLocaleString()}
              </div>
              <Button
                onClick={() => handleFinish(ch.id)}
                disabled={processingId === ch.id || doneIds.includes(ch.id)}
              >
                {processingId === ch.id
                  ? "Memproses..."
                  : doneIds.includes(ch.id)
                  ? "Sudah Selesai"
                  : "Selesaikan Championship"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

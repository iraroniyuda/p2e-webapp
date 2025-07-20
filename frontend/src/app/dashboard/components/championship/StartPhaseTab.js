"use client";

import { getMyChampionships, startChampionshipPhase } from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";

export default function StartPhaseTab() {
  const [championships, setChampionships] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState({});
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchChampionships();
  }, []);

  const fetchChampionships = async () => {
    try {
      const data = await getMyChampionships();
      setChampionships(data.filter((ch) => ch.status === "upcoming"));
    } catch (err) {
      console.error("❌ Gagal ambil championship", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPhase = async (championshipId) => {
    const phase = selectedPhase[championshipId];
    if (!phase) return alert("❗ Harap pilih fase.");

    try {
      setProcessingId(championshipId);
      await startChampionshipPhase(championshipId, phase);
      alert(`✅ Fase '${phase}' berhasil dimulai!`);
    } catch (err) {
      alert("❌ Gagal mulai fase: " + err?.response?.data?.error || "Unknown error");
    } finally {
      setProcessingId(null);
    }
  };

  const handlePhaseChange = (championshipId, phase) => {
    setSelectedPhase((prev) => ({
      ...prev,
      [championshipId]: phase,
    }));
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4 text-light">Start Championship Phase</h3>
      {championships.length === 0 ? (
        <p className="text-muted">Belum ada championship yang bisa dimulai.</p>
      ) : (
        <div className="space-y-4">
          {championships.map((ch) => (
            <div
              key={ch.id}
              className="p-4 bg-white rounded shadow-sm text-black"
            >
              <div className="font-bold text-lg mb-1">{ch.title}</div>
              <div className="text-sm text-gray-600 mb-2">
                Jadwal: {new Date(ch.request?.scheduledAt).toLocaleString()}
              </div>

              <Form.Group className="mb-2">
                <Form.Label>Pilih fase yang ingin dimulai:</Form.Label>
                <Form.Select
                  value={selectedPhase[ch.id] || ""}
                  onChange={(e) => handlePhaseChange(ch.id, e.target.value)}
                >
                  <option value="">-- Pilih Fase --</option>
                  <option value="qualifier">Qualifier</option>
                  <option value="semifinal">Semifinal</option>
                  <option value="final">Final</option>
                  <option value="grand_final">Grand Final</option>
                </Form.Select>
              </Form.Group>

              <Button
                onClick={() => handleStartPhase(ch.id)}
                disabled={processingId === ch.id}
              >
                {processingId === ch.id ? "Memulai..." : "Mulai Fase"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

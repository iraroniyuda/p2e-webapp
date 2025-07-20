"use client";

import {
  assignPhaseGroups,
  getAllChampionships,
  getPoolParticipantsForPhase,
} from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";

export default function StartPhaseTab() {
  const [championships, setChampionships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({});
  const [processingId, setProcessingId] = useState(null);
  const [poolCounts, setPoolCounts] = useState({}); // { `${chId}_${phase}`: jumlah peserta }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getAllChampionships();
      setChampionships(data);
    } catch (err) {
      console.error("❌ Gagal ambil championship", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPool = async (chId, phase) => {
    if (!chId || !phase) return;
    try {
      const pool = await getPoolParticipantsForPhase(chId, phase);
      setPoolCounts((prev) => ({
        ...prev,
        [`${chId}_${phase}`]: Array.isArray(pool) ? pool.length : 0,
      }));
    } catch {
      setPoolCounts((prev) => ({
        ...prev,
        [`${chId}_${phase}`]: 0,
      }));
    }
  };

  const handleInputChange = (chId, field, value) => {
    setFormState((prev) => ({
      ...prev,
      [chId]: {
        ...prev[chId],
        [field]: value,
      },
    }));
    if (field === "phase") {
      fetchPool(chId, value);
    }
  };

  const handleStartPhase = async (chId) => {
    const form = formState[chId];
    const phase = form?.phase;
    const maxPerGroup = form?.maxPerGroup;
    const poolKey = `${chId}_${phase}`;
    const poolCount = poolCounts[poolKey] ?? 0;

    if (!phase || !maxPerGroup) {
      return alert("⚠️ Lengkapi semua field.");
    }
    // Hanya cek poolCount jika phase selain "qualifier"
    if (phase !== "qualifier" && poolCount === 0) {
      return alert("❌ Tidak ada peserta yang bisa di-assign ke grup pada fase ini.");
    }
    try {
      setProcessingId(chId);
      await assignPhaseGroups(chId, phase, parseInt(maxPerGroup));
      alert("✅ Fase dimulai dan grup telah dibuat!");
      fetchPool(chId, phase);
    } catch (err) {
      console.error("❌ Gagal memulai fase", err);
      alert("❌ Error: " + (err?.response?.data?.error || "Unknown error"));
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4 text-light">Mulai Fase & Bagi Grup</h3>
      {championships.length === 0 ? (
        <p className="text-white">Tidak ada championship.</p>
      ) : (
        <div className="space-y-4">
          {championships.map((ch) => {
            const form = formState[ch.id] || {};
            const poolKey = `${ch.id}_${form.phase || ""}`;
            const poolCount = poolCounts[poolKey] ?? null;

            return (
              <div key={ch.id} className="p-4 bg-white shadow rounded text-black">
                <div className="font-bold text-lg mb-1">{ch.request?.title || "(Tanpa Judul)"}</div>
                <div className="text-sm mb-2">
                  Jadwal: {new Date(ch.request?.scheduledAt).toLocaleString()}
                </div>
                <Form.Group className="mb-2">
                  <Form.Label>Pilih Fase</Form.Label>
                  <Form.Select
                    value={form.phase || ""}
                    onChange={(e) => handleInputChange(ch.id, "phase", e.target.value)}
                  >
                    <option value="">-- Pilih Fase --</option>
                    <option value="qualifier">Qualifier</option>
                    <option value="semifinal">Semifinal</option>
                    <option value="final">Final</option>
                    <option value="grand_final">Grand Final</option>
                  </Form.Select>
                </Form.Group>

                {/* Pool info */}
                {form.phase && (
                  <div className="mb-2">
                    Jumlah peserta pool:&nbsp;
                    {form.phase === "qualifier" ? (
                      <span className="text-muted">Otomatis dari peserta yang sudah diapprove</span>
                    ) : poolCount === null ? (
                      <Spinner size="sm" animation="border" />
                    ) : (
                      <b>{poolCount}</b>
                    )}
                  </div>
                )}

                <Form.Group className="mb-2">
                  <Form.Label>Maksimal Peserta per Grup</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    value={form.maxPerGroup || ""}
                    onChange={(e) =>
                      handleInputChange(ch.id, "maxPerGroup", e.target.value)
                    }
                  />
                </Form.Group>

                <Button
                  onClick={() => handleStartPhase(ch.id)}
                  disabled={
                    processingId === ch.id ||
                    (form.phase && form.phase !== "qualifier" && poolCount === 0)
                  }
                >
                  {processingId === ch.id
                    ? "Memproses..."
                    : "Mulai Fase & Buat Grup"}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

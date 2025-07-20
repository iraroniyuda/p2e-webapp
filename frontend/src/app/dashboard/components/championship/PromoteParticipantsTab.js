"use client";

import {
  getMyChampionships,
  promoteTopParticipants,
} from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";

export default function PromoteParticipantsTab() {
  const [championships, setChampionships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({});
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getMyChampionships();
      setChampionships(data);
    } catch (err) {
      console.error("❌ Gagal ambil data championship", err);
    } finally {
      setLoading(false);
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
  };

  const handlePromote = async (chId) => {
    const form = formState[chId];
    if (!form?.fromPhase || !form?.toPhase || !form?.topNPerGroup) {
      return alert("⚠️ Lengkapi semua field terlebih dahulu.");
    }

    try {
      setProcessingId(chId);
      await promoteTopParticipants(
        chId,
        form.fromPhase,
        form.toPhase,
        parseInt(form.topNPerGroup)
      );
      alert("✅ Promosi peserta berhasil!");
    } catch (err) {
      console.error("❌ Gagal promosi peserta", err);
      alert("❌ Error: " + (err?.response?.data?.error || "Unknown error"));
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4 text-light">Promote Participants</h3>
      {championships.length === 0 ? (
        <p className="text-gray-500">Belum ada championship.</p>
      ) : (
        <div className="space-y-4">
          {championships.map((ch) => {
            const form = formState[ch.id] || {};
            return (
              <div
                key={ch.id}
                className="p-4 bg-white text-black shadow rounded"
              >
                <div className="font-bold text-lg">{ch.title}</div>
                <Form.Group className="mt-2 mb-2">
                  <Form.Label>Dari Fase</Form.Label>
                  <Form.Select
                    value={form.fromPhase || ""}
                    onChange={(e) =>
                      handleInputChange(ch.id, "fromPhase", e.target.value)
                    }
                  >
                    <option value="">-- Pilih --</option>
                    <option value="qualifier">Qualifier</option>
                    <option value="semifinal">Semifinal</option>
                    <option value="final">Final</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Ke Fase</Form.Label>
                  <Form.Select
                    value={form.toPhase || ""}
                    onChange={(e) =>
                      handleInputChange(ch.id, "toPhase", e.target.value)
                    }
                  >
                    <option value="">-- Pilih --</option>
                    <option value="semifinal">Semifinal</option>
                    <option value="final">Final</option>
                    <option value="grand_final">Grand Final</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Top N dari setiap grup</Form.Label>
                  <Form.Control
                    type="number"
                    value={form.topNPerGroup || ""}
                    onChange={(e) =>
                      handleInputChange(ch.id, "topNPerGroup", e.target.value)
                    }
                  />
                </Form.Group>

                <Button
                  onClick={() => handlePromote(ch.id)}
                  disabled={processingId === ch.id}
                >
                  {processingId === ch.id ? "Memproses..." : "Promote"}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

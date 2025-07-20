"use client";

import {
  assignPhaseGroups,
  getAllChampionships,
  getMatchGroups,
  getParticipantsByPhase,
} from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";

export default function PromoteParticipantsTab() {
  const [championships, setChampionships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({});
  const [groupMembers, setGroupMembers] = useState({});
  const [toPhaseGroups, setToPhaseGroups] = useState({});
  const [processing, setProcessing] = useState({});
  const [promotePool, setPromotePool] = useState({}); // { groupId: [userId, ...] }

  useEffect(() => {
    fetchChampionships();
  }, []);

  // Fetch championship list
  const fetchChampionships = async () => {
    setLoading(true);
    try {
      const data = await getAllChampionships();
      setChampionships(data);
    } catch (err) {
      console.error("❌ Gagal ambil championship", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch group asal per phase
  const fetchGroupMembers = async (chId, fromPhase) => {
    if (!chId || !fromPhase) return;
    const key = `${chId}_${fromPhase}`;
    setGroupMembers((prev) => ({ ...prev, [key]: { loading: true, data: [] } }));
    try {
      const data = await getParticipantsByPhase(chId, fromPhase);
      setGroupMembers((prev) => ({
        ...prev,
        [key]: { loading: false, data },
      }));
      // Reset promotePool jika ganti phase
      setPromotePool({});
    } catch (err) {
      alert("❌ Gagal ambil peserta: " + (err?.response?.data?.error || err.message));
      setGroupMembers((prev) => ({ ...prev, [key]: { loading: false, data: [] } }));
    }
  };

  // Fetch semua grup phase tujuan
  const fetchToPhaseGroups = async (chId, toPhase) => {
    if (!chId || !toPhase) return;
    try {
      const arr = await getMatchGroups(chId, toPhase);
      setToPhaseGroups((prev) => ({
        ...prev,
        [`${chId}_${toPhase}`]: arr,
      }));
    } catch {
      setToPhaseGroups((prev) => ({
        ...prev,
        [`${chId}_${toPhase}`]: [],
      }));
    }
  };

  // Handler input select dan Top N
  const handleInputChange = (chId, field, value) => {
    setFormState((prev) => ({
      ...prev,
      [chId]: {
        ...prev[chId],
        [field]: value,
      },
    }));
    if (field === "fromPhase") fetchGroupMembers(chId, value);
    if (field === "toPhase") fetchToPhaseGroups(chId, value);
  };

  // Handler promote satu grup saja (pooling di frontend)
  const handlePromoteSingleGroup = (chId, group, topNPerGroup) => {
    if (!topNPerGroup || !group || !Array.isArray(group.members)) return;
    const sorted = [...group.members]
      .filter((m) => m.position != null)
      .sort((a, b) => a.position - b.position)
      .slice(0, Number(topNPerGroup))
      .map((m) => m.userId);

    setPromotePool((prev) => ({
      ...prev,
      [group.groupId]: sorted,
    }));
  };

  // Cek sudah di-promote (masuk pool)
  const isGroupAlreadyPromoted = (groupId) => {
    return Array.isArray(promotePool[groupId]) && promotePool[groupId].length > 0;
  };

  // Assign phase berikutnya dengan peserta pool
  const handleAssignPhaseGroups = async (chId, toPhase, maxPerGroup) => {
    if (!toPhase || !maxPerGroup) return alert("Lengkapi semua field!");
    // Gabungkan semua userId dari promotePool
    const allUserIds = Object.values(promotePool).flat();
    if (allUserIds.length === 0) return alert("Pool kosong!");

    setProcessing((prev) => ({ ...prev, assign: true }));
    try {
      await assignPhaseGroups(chId, toPhase, maxPerGroup, allUserIds);
      alert("✅ Grup baru berhasil dibuat!");
      setPromotePool({});
      await fetchToPhaseGroups(chId, toPhase);
    } catch (err) {
      alert("❌ Error: " + (err?.response?.data?.error || err.message));
    } finally {
      setProcessing((prev) => ({ ...prev, assign: false }));
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4 text-light">Promote Participants</h3>
      {championships.length === 0 ? (
        <p className="text-gray-500">Belum ada championship tersedia.</p>
      ) : (
        <div className="space-y-4">
          {championships.map((ch) => {
            const form = formState[ch.id] || {};
            const fromKey = `${ch.id}_${form.fromPhase || ""}`;
            const toKey = `${ch.id}_${form.toPhase || ""}`;
            const groupObj = groupMembers[fromKey] || { loading: false, data: [] };
            const targetGroups = toPhaseGroups[toKey] || [];
            const topNPerGroup = form.topNPerGroup || "";
            const maxPerGroup = form.maxPerGroup || 10;

            // Hitung sudah berapa grup masuk pool
            const poolGroupCount = Object.keys(promotePool).length;
            const totalGroupCount = groupObj.data.length;

            return (
              <div key={ch.id} className="p-4 bg-white text-black shadow rounded mb-3">
                <div className="font-bold text-lg mb-2">
                  {ch.request?.title || "(Tanpa Judul)"} — ID {ch.id}
                </div>

                {/* Phase selector */}
                <Form.Group className="mb-2">
                  <Form.Label>Dari Fase</Form.Label>
                  <Form.Select
                    value={form.fromPhase || ""}
                    onChange={(e) =>
                      handleInputChange(ch.id, "fromPhase", e.target.value)
                    }
                  >
                    <option value="">-- Pilih Fase --</option>
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
                    <option value="">-- Pilih Fase --</option>
                    <option value="semifinal">Semifinal</option>
                    <option value="final">Final</option>
                    <option value="grand_final">Grand Final</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Top N dari setiap grup</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    value={topNPerGroup}
                    onChange={(e) =>
                      handleInputChange(ch.id, "topNPerGroup", e.target.value)
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Maksimal peserta per grup (fase berikutnya)</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    value={maxPerGroup}
                    onChange={(e) =>
                      handleInputChange(ch.id, "maxPerGroup", e.target.value)
                    }
                  />
                </Form.Group>

                {/* Tabel & tombol promote per grup */}
                {form.fromPhase && (
                  <div className="mb-3">
                    <div className="fw-bold">Peserta & Hasil Grup:</div>
                    {groupObj.loading ? (
                      <div>
                        <Spinner size="sm" animation="border" /> Memuat...
                      </div>
                    ) : (
                      groupObj.data.map((group) => {
                        const canPromote =
                          group.status === "done" &&
                          !isGroupAlreadyPromoted(group.groupId) &&
                          !!form.toPhase &&
                          !!topNPerGroup &&
                          form.fromPhase !== form.toPhase;

                        return (
                          <div key={group.groupId} className="mb-2">
                            <div className="fw-bold mb-1">
                              Grup #{group.groupNumber} ({group.status})
                            </div>
                            <table className="table table-sm table-bordered">
                              <thead>
                                <tr>
                                  <th>Username</th>
                                  <th>Email</th>
                                  <th>Result</th>
                                  <th>Finish Time</th>
                                </tr>
                              </thead>
                              <tbody>
                                {group.members.map((m) => (
                                  <tr key={m.user?.id || m.userId}>
                                    <td>{m.user?.username || m.userId}</td>
                                    <td>{m.user?.email || "-"}</td>
                                    <td>{m.position ?? ""}</td>
                                    <td>
                                      {m.time !== null && m.time !== undefined
                                        ? Number(m.time).toFixed(2) + " s"
                                        : ""}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {/* Tombol per grup */}
                            {canPromote && (
                              <Button
                                onClick={() =>
                                  handlePromoteSingleGroup(
                                    ch.id,
                                    group,
                                    topNPerGroup
                                  )
                                }
                                variant="primary"
                                disabled={isGroupAlreadyPromoted(group.groupId)}
                              >
                                Promosikan Grup Ini
                              </Button>
                            )}
                            {isGroupAlreadyPromoted(group.groupId) && (
                              <span className="ms-2 text-success fw-bold">
                                ✓ Sudah Promosi
                              </span>
                            )}
                            {group.status !== "done" && (
                              <span className="ms-2 text-warning fw-bold">
                                (Belum selesai)
                              </span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Tombol Assign Phase Berikutnya */}
                {form.toPhase && maxPerGroup > 0 && poolGroupCount === totalGroupCount && totalGroupCount > 0 && (
                  <Button
                    onClick={() =>
                      handleAssignPhaseGroups(ch.id, form.toPhase, maxPerGroup)
                    }
                    disabled={!!processing.assign}
                    variant="success"
                  >
                    {processing.assign
                      ? "Memproses..."
                      : `Buat Grup "${form.toPhase}"`}
                  </Button>
                )}
                {poolGroupCount < totalGroupCount && totalGroupCount > 0 && (
                  <span className="ms-2 text-danger fw-bold">
                    Semua grup harus dipromosikan dulu!
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

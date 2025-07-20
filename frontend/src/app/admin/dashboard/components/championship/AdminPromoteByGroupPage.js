"use client";

import {
    getAllChampionships,
    getParticipantsByPhase,
    promoteTopParticipants,
} from "@/services/apiClient";

import { useEffect, useState } from "react";
import { Button, Form, Spinner, Table } from "react-bootstrap";

export default function AdminPromoteByGroupPage() {
  const [championships, setChampionships] = useState([]);
  const [selectedChampionshipId, setSelectedChampionshipId] = useState(null);
  const [phase, setPhase] = useState("qualifier");
  const [groups, setGroups] = useState([]);
  const [topNMap, setTopNMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [processingGroupId, setProcessingGroupId] = useState(null);

  useEffect(() => {
    fetchChampionships();
  }, []);

  useEffect(() => {
    if (selectedChampionshipId) {
      fetchGroups();
    }
  }, [selectedChampionshipId, phase]);

  const fetchChampionships = async () => {
    try {
      const data = await getAllChampionships();
      setChampionships(data);
    } catch (err) {
      console.error("❌ Gagal ambil championship", err);
    }
  };

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const data = await getParticipantsByPhase(selectedChampionshipId, phase);
      setGroups(data);
    } catch (err) {
      console.error("❌ Gagal ambil grup", err);
    } finally {
      setLoading(false);
    }
  };

  const nextPhase = (current) => {
    const order = ["qualifier", "semifinal", "final", "grand_final"];
    const index = order.indexOf(current);
    return index >= 0 && index < order.length - 1 ? order[index + 1] : null;
  };

  const handlePromote = async (groupId) => {
    const topN = parseInt(topNMap[groupId] || 0);
    if (!topN || isNaN(topN)) return alert("❗ Masukkan jumlah Top N yang valid.");

    try {
      setProcessingGroupId(groupId);
      await promoteTopParticipants(
        selectedChampionshipId,
        phase,
        nextPhase(phase),
        topN
      );
      alert("✅ Berhasil promosi!");
      fetchGroups(); // refresh ulang
    } catch (err) {
      console.error("❌ Gagal promosi:", err);
      alert("❌ Gagal promosi: " + (err?.response?.data?.error || "Unknown error"));
    } finally {
      setProcessingGroupId(null);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-light">Promosi Peserta per Grup</h2>

      {/* Pilih championship */}
      <Form.Select
        className="mb-3"
        value={selectedChampionshipId || ""}
        onChange={(e) => {
          setSelectedChampionshipId(parseInt(e.target.value));
          setGroups([]);
          setTopNMap({});
        }}
      >
        <option value="">-- Pilih Championship --</option>
        {championships.map((ch) => (
          <option key={ch.id} value={ch.id}>
            {ch.request?.title || "(Tanpa Judul)"} — ID {ch.id}
          </option>
        ))}
      </Form.Select>

      {/* Pilih fase */}
      <Form.Select
        className="mb-4"
        value={phase}
        onChange={(e) => {
          setPhase(e.target.value);
          setGroups([]);
        }}
      >
        <option value="qualifier">Qualifier</option>
        <option value="semifinal">Semifinal</option>
        <option value="final">Final</option>
      </Form.Select>

      {loading ? (
        <Spinner animation="border" />
      ) : (
        groups.map((group) => (
          <div key={group.groupId} className="bg-white text-black p-4 mb-4 rounded shadow">
            <h5 className="font-bold mb-2">Group #{group.groupNumber} – {group.phase.toUpperCase()}</h5>

            <Table size="sm" bordered>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Posisi</th>
                  <th>Waktu</th>
                </tr>
              </thead>
              <tbody>
                {group.members
                  .sort((a, b) => a.position - b.position)
                  .map((m) => (
                    <tr key={m.userId}>
                      <td>{m.user?.username || m.userId}</td>
                      <td>{m.position}</td>
                      <td>{m.time || "-"}</td>
                    </tr>
                  ))}
              </tbody>
            </Table>

            <Form.Group className="mb-2">
              <Form.Label>Top N yang dipromosikan ke {nextPhase(group.phase)}</Form.Label>
              <Form.Control
                type="number"
                min={1}
                value={topNMap[group.groupId] || ""}
                onChange={(e) =>
                  setTopNMap((prev) => ({
                    ...prev,
                    [group.groupId]: e.target.value,
                  }))
                }
              />
            </Form.Group>

            <Button
              onClick={() => handlePromote(group.groupId)}
              disabled={processingGroupId === group.groupId}
            >
              {processingGroupId === group.groupId ? "Memproses..." : "Promosikan"}
            </Button>
          </div>
        ))
      )}
    </div>
  );
}

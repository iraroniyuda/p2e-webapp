// components/game/AdminAssignRoomTab.tsx
"use client";

import {
  createRoomForGroup,
  getAllChampionships,
  getMatchGroups,
  startGroupRace,
} from "@/services/apiClient";

import { useEffect, useState } from "react";
import { Button, Form, Table } from "react-bootstrap";

export default function AdminAssignRoomTab() {
  const [championshipId, setChampionshipId] = useState("");
  const [phase, setPhase] = useState("qualifier");
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [championships, setChampionships] = useState([]);

  useEffect(() => {
    getAllChampionships().then(setChampionships).catch(console.error);
  }, []);

  const fetchGroups = async () => {
    if (!championshipId || !phase) return;
    setLoadingGroups(true);
    try {
      const data = await getMatchGroups(championshipId, phase);
      setGroups(data);
    } catch (err) {
      alert("❌ Gagal ambil grup: " + (err?.response?.data?.error || err.message));
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleCreateRoom = async (groupId, groupNumber) => {
    try {
      await createRoomForGroup(groupId);
      alert(`✅ Room berhasil dibuat untuk Group ${groupNumber}`);
      fetchGroups();
    } catch (err) {
      alert("❌ Gagal membuat room: " + (err.response?.data?.error || err.message));
    }
  };

  const handleStartRace = async (groupId, groupNumber) => {
    try {
      await startGroupRace(groupId);
      alert(`🏁 Race dimulai untuk Group ${groupNumber}`);
      fetchGroups();
    } catch (err) {
      alert("❌ Gagal mulai race: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4 text-light">Assign Room (Admin)</h3>

      <Form.Group className="mb-2">
        <Form.Label>Pilih Championship</Form.Label>
        <Form.Select
          value={championshipId}
          onChange={(e) => setChampionshipId(e.target.value)}
        >
          <option value="">-- Pilih Championship --</option>
          {championships.map((ch) => (
            <option key={ch.id} value={ch.id}>
              {ch.request?.title || "Tanpa Judul"} — ID {ch.id}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Pilih Fase</Form.Label>
        <Form.Select value={phase} onChange={(e) => setPhase(e.target.value)}>
          <option value="qualifier">Qualifier</option>
          <option value="semifinal">Semifinal</option>
          <option value="final">Final</option>
          <option value="grand_final">Grand Final</option>
        </Form.Select>
      </Form.Group>

      <Button
        onClick={fetchGroups}
        disabled={!championshipId || loadingGroups}
        className="mb-3"
      >
        {loadingGroups ? "Memuat..." : "Tampilkan Grup"}
      </Button>

      {groups.map((group) => (
        <div key={group.id} className="mb-4 p-3 bg-white text-black rounded shadow">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="fw-bold">
              Group #{group.groupNumber} (ID: {group.id}) — {group.status}
            </div>
            <div className="d-flex gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleCreateRoom(group.id, group.groupNumber)}
              >
                Create Room
              </Button>
              <Button
                size="sm"
                variant="success"
                onClick={() => handleStartRace(group.id, group.groupNumber)}
              >
                Start Game
              </Button>
            </div>
          </div>

          <Table size="sm" striped bordered>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {group.members.map((m) => {
                const userId = m.user?.id || m.userId;
                const isOnline = group.roomStatus?.joinedUserIds?.includes(userId);
                return (
                  <tr key={userId}>
                    <td>{m.user?.username || userId}</td>
                    <td>{m.user?.email || "-"}</td>
                    <td>
                      {m.isReady ? "✅ Ready" : "❌ Not Ready"} <br />
                      {isOnline ? "🟢 Online" : "🔴 Offline"}
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={() => alert(`📡 Ping dikirim ke ${m.user?.username || userId}`)}
                      >
                        Ping
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      ))}
    </div>
  );
}

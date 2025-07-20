"use client";

import {
    getAllChampionships,
    getParticipantsByPhase,
} from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Form, Spinner, Table } from "react-bootstrap";

export default function ViewPhaseParticipantsTab() {
  const [championships, setChampionships] = useState([]);
  const [selectedChampionshipId, setSelectedChampionshipId] = useState("");
  const [selectedPhase, setSelectedPhase] = useState("qualifier");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  const phases = ["qualifier", "semifinal", "final", "grand_final"];

  useEffect(() => {
    const fetchChampionships = async () => {
      try {
        const data = await getAllChampionships();
        setChampionships(data);
        if (data.length > 0) setSelectedChampionshipId(data[0].id);
      } catch (err) {
        console.error("❌ Gagal ambil championship", err);
      }
    };
    fetchChampionships();
  }, []);

  useEffect(() => {
    const fetchParticipants = async () => {
      if (!selectedChampionshipId || !selectedPhase) return;
      setLoading(true);
      try {
        const data = await getParticipantsByPhase(selectedChampionshipId, selectedPhase);
        setGroups(data);
      } catch (err) {
        console.error("❌ Gagal ambil peserta per fase", err);
      } finally {
        setLoading(false);
      }
    };
    fetchParticipants();
  }, [selectedChampionshipId, selectedPhase]);

  return (
    <div className="bg-white text-black p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-3">Peserta per Fase</h2>

      <div className="d-flex flex-wrap gap-3 mb-3">
        <Form.Select
          value={selectedChampionshipId}
          onChange={(e) => setSelectedChampionshipId(e.target.value)}
        >
          {championships.map((ch) => (
            <option key={ch.id} value={ch.id}>
              {ch.request?.title || `Championship ${ch.id}`}
            </option>
          ))}
        </Form.Select>

        <Form.Select
          value={selectedPhase}
          onChange={(e) => setSelectedPhase(e.target.value)}
        >
          {phases.map((p) => (
            <option key={p} value={p}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </Form.Select>
      </div>

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <>
          {groups.length === 0 ? (
            <p>Belum ada grup untuk fase ini.</p>
          ) : (
            groups.map((group) => (
              <div key={group.groupId} className="mb-4">
                <h5>
                  Grup #{group.groupNumber} ({group.status})
                </h5>
                <Table bordered striped hover responsive>
                  <thead>
                    <tr>
                      <th>Posisi</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Time</th>
                      <th>Siap?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.members.map((m, idx) => (
                      <tr key={m.userId}>
                        <td>{m.position ?? "-"}</td>
                        <td>{m.user.username}</td>
                        <td>{m.user.email}</td>
                        <td>{m.time ?? "-"}</td>
                        <td>{m.isReady ? "✅" : "❌"}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}

"use client";

import {
  approveOrRejectParticipant,
  getAllChampionships,
  getChampionshipParticipants,
} from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Accordion, Button, Spinner, Table } from "react-bootstrap";

export default function ParticipantApprovalTab() {
  const [championships, setChampionships] = useState([]);
  const [participantsMap, setParticipantsMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChampionships();
  }, []);

  const fetchChampionships = async () => {
    try {
      const data = await getAllChampionships(); // admin gets all managed championships
      setChampionships(data);
    } catch (err) {
      console.error("❌ Gagal mengambil data championship", err);
    } finally {
      setLoading(false);
    }
  };

  const loadParticipants = async (championshipId) => {
    try {
      const data = await getChampionshipParticipants(championshipId);
      setParticipantsMap((prev) => ({ ...prev, [championshipId]: data }));
    } catch (err) {
      console.error("❌ Gagal mengambil peserta", err);
    }
  };

  const handleAction = async (participantId, action, championshipId) => {
    try {
      await approveOrRejectParticipant(participantId, action);
      await loadParticipants(championshipId); // refresh after action
    } catch (err) {
      console.error("❌ Gagal mengubah status peserta", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4 text-light">
        Approval Peserta Championship
      </h3>

      {championships.length === 0 ? (
        <p className="text-gray-400">Belum ada championship yang tersedia.</p>
      ) : (
        <Accordion>
          {championships.map((ch, idx) => (
            <Accordion.Item eventKey={idx.toString()} key={ch.id}>
              <Accordion.Header>
                {ch.request?.title || "(Tanpa Judul)"} —{" "}
                {new Date(ch.request?.scheduledAt).toLocaleString()}
              </Accordion.Header>

              <Accordion.Body>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mb-2"
                  onClick={() => loadParticipants(ch.id)}
                >
                  Tampilkan Peserta
                </Button>

                {participantsMap[ch.id] ? (
                  <Table bordered size="sm" className="mt-2">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participantsMap[ch.id].map((p) => (
                        <tr key={p.id}>
                          <td>{p.user?.username || p.User?.username || p.userId}</td>
                          <td>{p.user?.email || p.User?.email || "-"}</td>
                          <td>{p.status}</td>
                          <td>
                            {p.status === "pending" ? (
                              <>
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => handleAction(p.id, "approve", ch.id)}
                                >
                                  Approve
                                </Button>{" "}
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleAction(p.id, "reject", ch.id)}
                                >
                                  Reject
                                </Button>
                              </>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p className="text-white">Belum ada data peserta.</p>
                )}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </div>
  );
}

"use client";

import {
  approveOrRejectParticipant,
  getChampionshipParticipants,
  getMyChampionships,
} from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Accordion, Button, Spinner, Table } from "react-bootstrap";

export default function ManageParticipantsTab() {
  const [myChampionships, setMyChampionships] = useState([]);
  const [participantsMap, setParticipantsMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChampionships();
  }, []);

  const loadChampionships = async () => {
    try {
      const data = await getMyChampionships();
      setMyChampionships(data);
    } catch (err) {
      console.error("❌ Gagal load championship", err);
    } finally {
      setLoading(false);
    }
  };

  const loadParticipants = async (championshipId) => {
    try {
      const data = await getChampionshipParticipants(championshipId);
      setParticipantsMap((prev) => ({ ...prev, [championshipId]: data }));
    } catch (err) {
      console.error("❌ Gagal load peserta", err);
    }
  };

  const handleAction = async (participantId, action, championshipId) => {
    try {
      await approveOrRejectParticipant(participantId, action);
      await loadParticipants(championshipId); // refresh
    } catch (err) {
      console.error("❌ Gagal update status peserta", err);
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4 text-light">Manage Participants</h3>
      {myChampionships.length === 0 ? (
        <p className="text-gray-500">Tidak ada championship milikmu.</p>
      ) : (
        <Accordion>
          {myChampionships.map((ch, idx) => (
            <Accordion.Item eventKey={idx.toString()} key={ch.id}>
              <Accordion.Header>
                {ch.title} — {new Date(ch.request?.scheduledAt).toLocaleString()}
              </Accordion.Header>
              <Accordion.Body>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mb-2"
                  onClick={() => loadParticipants(ch.id)}
                >
                  Load Peserta
                </Button>

                {participantsMap[ch.id] ? (
                  <Table bordered size="sm">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participantsMap[ch.id].map((p) => (
                        <tr key={p.id}>
                          <td>
                            {p.user?.username || p.User?.username || p.userId}
                            {" / "}
                            {p.user?.email || p.User?.email || "-"}
                          </td>
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
                              "-"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p className="text-muted">Belum ada data peserta.</p>
                )}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </div>
  );
}

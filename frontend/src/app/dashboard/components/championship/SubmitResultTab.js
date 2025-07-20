// REF: SubmitResultTab
"use client";

import {
  getMatchGroups,
  getMyChampionships,
  submitGroupResult,
} from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Accordion, Button, Form, Spinner, Table } from "react-bootstrap";

export default function SubmitResultTab() {
  const [championships, setChampionships] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState({});
  const [groupsMap, setGroupsMap] = useState({});
  const [resultInputs, setResultInputs] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChampionships();
  }, []);

  const loadChampionships = async () => {
    try {
      const data = await getMyChampionships();
      setChampionships(data);
    } catch (err) {
      console.error("❌ Gagal load championship", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadGroups = async (chId) => {
    const phase = selectedPhase[chId];
    if (!phase) return alert("Pilih fase dulu");

    try {
      const groups = await getMatchGroups(chId, phase);
      setGroupsMap((prev) => ({ ...prev, [chId]: groups }));

      const init = {};
      groups.forEach((group) => {
        group.members?.forEach((m) => {
          init[`${group.id}-${m.userId}`] = {
            position: m.resultPosition || "",
            time: m.finishTime || "",
          };
        });
      });
      setResultInputs(init);
    } catch (err) {
      console.error("❌ Gagal ambil grup", err);
    }
  };

  const handleChange = (groupId, userId, field, value) => {
    setResultInputs((prev) => ({
      ...prev,
      [`${groupId}-${userId}`]: {
        ...prev[`${groupId}-${userId}`],
        [field]: value,
      },
    }));
  };

  const handleSubmitGroup = async (groupId, members = []) => {
    const payload = members.map((m) => {
      const input = resultInputs[`${groupId}-${m.userId}`] || {};
      return {
        userId: m.userId,
        position: parseInt(input.position),
        time: input.time,
      };
    });

    try {
      await submitGroupResult(groupId, payload);
      alert("✅ Hasil disimpan.");
    } catch (err) {
      console.error("❌ Submit error:", err);
      alert("Gagal simpan hasil: " + (err?.response?.data?.error || "Unknown"));
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4 text-light">Submit Hasil Balapan</h3>
      {championships.length === 0 ? (
        <p>Tidak ada championship.</p>
      ) : (
        <Accordion>
          {championships.map((ch, idx) => (
            <Accordion.Item key={ch.id} eventKey={idx.toString()}>
              <Accordion.Header>{ch.title}</Accordion.Header>
              <Accordion.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Pilih fase</Form.Label>
                  <Form.Select
                    value={selectedPhase[ch.id] || ""}
                    onChange={(e) =>
                      setSelectedPhase((prev) => ({
                        ...prev,
                        [ch.id]: e.target.value,
                      }))
                    }
                  >
                    <option value="">-- Pilih Fase --</option>
                    <option value="qualifier">Qualifier</option>
                    <option value="semifinal">Semifinal</option>
                    <option value="final">Final</option>
                    <option value="grand_final">Grand Final</option>
                  </Form.Select>
                </Form.Group>

                <Button onClick={() => handleLoadGroups(ch.id)} className="mb-3">
                  Load Grup
                </Button>

                {(groupsMap[ch.id] || []).map((group) => (
                  <div key={group.id} className="mb-4 border p-3 rounded bg-light">
                    <h5>Grup {group.groupNumber} (Fase: {group.phase})</h5>
                    <Table size="sm" bordered className="mt-2">
                      <thead>
                        <tr>
                          <th>Nama</th>
                          <th>Posisi</th>
                          <th>Waktu (misal 01:34.56)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(group.members || []).map((m) => (
                          <tr key={m.userId}>
                            <td>
                              {m.user?.username || m.User?.username || m.userId}
                              {" / "}
                              {m.user?.email || m.User?.email || "-"}
                            </td>
                            <td>
                              <Form.Control
                                type="number"
                                value={
                                  resultInputs[`${group.id}-${m.userId}`]?.position || ""
                                }
                                onChange={(e) =>
                                  handleChange(group.id, m.userId, "position", e.target.value)
                                }
                              />
                            </td>
                            <td>
                              <Form.Control
                                type="text"
                                value={
                                  resultInputs[`${group.id}-${m.userId}`]?.time || ""
                                }
                                onChange={(e) =>
                                  handleChange(group.id, m.userId, "time", e.target.value)
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleSubmitGroup(group.id, group.members)}
                    >
                      Submit Hasil Grup
                    </Button>
                  </div>
                ))}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </div>
  );
}

"use client";

import { getAllChampionships, getMatchGroups } from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Form, Spinner, Table } from "react-bootstrap";

export default function ViewPhaseGroupsTab() {
  const [championships, setChampionships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhase, setSelectedPhase] = useState("qualifier");
  const [selectedChampionshipId, setSelectedChampionshipId] = useState(null);
  const [groups, setGroups] = useState([]);
  const [groupLoading, setGroupLoading] = useState(false);

  useEffect(() => {
    getAllChampionships() // ✅ Ganti fungsi
      .then((data) => setChampionships(data))
      .catch((err) => console.error("❌ Gagal ambil championship", err))
      .finally(() => setLoading(false));
  }, []);


  const fetchGroups = async () => {
    if (!selectedChampionshipId || !selectedPhase) return;
    setGroupLoading(true);
    try {
      const result = await getMatchGroups(selectedChampionshipId, selectedPhase);
      setGroups(result);
    } catch (err) {
      console.error("❌ Gagal ambil grup", err);
    } finally {
      setGroupLoading(false);
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4 text-light">Lihat Grup per Fase</h3>

      <Form.Group className="mb-3">
        <Form.Label>Pilih Championship</Form.Label>
        <Form.Select
          value={selectedChampionshipId || ""}
          onChange={(e) => setSelectedChampionshipId(Number(e.target.value))}
        >
          <option value="">-- Pilih --</option>
            {championships.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.request?.title || `(Tanpa Judul)`} — ID {ch.id}
              </option>
            ))}

        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Pilih Fase</Form.Label>
        <Form.Select
          value={selectedPhase}
          onChange={(e) => setSelectedPhase(e.target.value)}
        >
          <option value="qualifier">Qualifier</option>
          <option value="semifinal">Semifinal</option>
          <option value="final">Final</option>
          <option value="grand_final">Grand Final</option>
        </Form.Select>
      </Form.Group>

      <button
        className="btn btn-primary mb-3"
        onClick={fetchGroups}
        disabled={!selectedChampionshipId || !selectedPhase || groupLoading}
      >
        {groupLoading ? "Memuat..." : "Tampilkan Grup"}
      </button>

      {groups.length > 0 && (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.id} className="p-3 bg-white rounded shadow text-black">
              <h5 className="font-bold">Grup #{group.groupNumber}</h5>
              <Table bordered size="sm" className="mt-2">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Posisi</th>
                    <th>Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {group.members.map((member, i) => (
                    <tr key={member.userId}>
                      <td>{i + 1}</td>
                      <td>{member.user?.username || "-"}</td>
                      <td>{member.user?.email || "-"}</td>
                      <td>{member.position || "-"}</td>
                      <td>{member.time || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

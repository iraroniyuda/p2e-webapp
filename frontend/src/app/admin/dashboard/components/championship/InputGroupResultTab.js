"use client";

import {
  getAllChampionships,
  getMatchGroups, // ✅ gunakan nama fungsi yang benar
  submitGroupResult,
} from "@/services/apiClient";

import { useEffect, useState } from "react";
import { Button, Form, Spinner, Table } from "react-bootstrap";

export default function InputGroupResultTab() {
  const [championships, setChampionships] = useState([]);
  const [selectedChampionshipId, setSelectedChampionshipId] = useState(null);
  const [selectedPhase, setSelectedPhase] = useState("");
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchChampionships();
  }, []);

const fetchChampionships = async () => {
  try {
    const data = await getAllChampionships(); // ✅ ganti ini
    setChampionships(data);
  } catch (err) {
    console.error("❌ Gagal ambil championship", err);
  }
};


  const fetchGroups = async () => {
    if (!selectedChampionshipId || !selectedPhase) return;
    setLoadingGroups(true);
    try {
      const data = await getMatchGroups(selectedChampionshipId, selectedPhase); // ✅ pakai getMatchGroups
      setGroups(data);
    } catch (err) {
      console.error("❌ Gagal ambil grup", err);
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleResultChange = (groupId, userId, field, value) => {
    setGroups((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          members: group.members.map((m) =>
            m.userId === userId ? { ...m, [field]: value } : m
          ),
        };
      })
    );
  };

  const handleSubmit = async (groupId) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    const results = group.members.map((m) => ({
      userId: m.userId,
      position: parseInt(m.position),
      time: m.time,
    }));

    try {
      setSaving(true);
      await submitGroupResult(groupId, results);
      alert("✅ Hasil grup disimpan.");
    } catch (err) {
      console.error("❌ Gagal simpan hasil grup", err);
      alert("❌ Error: " + (err?.response?.data?.error || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4 text-light">Input Hasil Grup</h3>

      <div className="mb-3">
        <Form.Select
          value={selectedChampionshipId || ""}
          onChange={(e) => {
            setSelectedChampionshipId(parseInt(e.target.value));
            setGroups([]); // 🧼 reset grup jika championship diganti
          }}
        >
          <option value="">-- Pilih Championship --</option>
          {championships.map((ch) => (
            <option key={ch.id} value={ch.id}>
              {ch.request?.title || "(Tanpa Judul)"} — ID {ch.id}
            </option>
          ))}
        </Form.Select>

      </div>

      <div className="mb-3">
        <Form.Select
          value={selectedPhase}
          onChange={(e) => setSelectedPhase(e.target.value)}
        >
          <option value="">-- Pilih Fase --</option>
          <option value="qualifier">Qualifier</option>
          <option value="semifinal">Semifinal</option>
          <option value="final">Final</option>
          <option value="grand_final">Grand Final</option>
        </Form.Select>
      </div>

      <Button variant="secondary" onClick={fetchGroups}>
        Tampilkan Grup
      </Button>

      {loadingGroups ? (
        <Spinner animation="border" className="mt-4" />
      ) : (
        <div className="mt-4 space-y-6">
          {groups.map((group) => (
            <div key={group.id} className="bg-white text-black p-4 shadow rounded">
              <h5 className="font-bold mb-2">Group #{group.groupNumber}</h5>
              <Table bordered size="sm">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Posisi</th>
                    <th>Waktu (opsional)</th>
                  </tr>
                </thead>
                <tbody>
                  {group.members.map((member) => (
                    <tr key={member.userId}>
                      <td>{member.user?.username || member.userId}</td>
                      <td>
                        <Form.Control
                          type="number"
                          value={member.position || ""}
                          onChange={(e) =>
                            handleResultChange(group.id, member.userId, "position", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          value={member.time || ""}
                          onChange={(e) =>
                            handleResultChange(group.id, member.userId, "time", e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Button
                onClick={() => handleSubmit(group.id)}
                disabled={saving}
              >
                Simpan Hasil Grup
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

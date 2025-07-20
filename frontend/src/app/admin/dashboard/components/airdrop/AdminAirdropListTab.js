"use client";

import apiClient from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import AirdropCreateModal from "./AirdropCreateModal";
import AirdropParticipantModal from "./AirdropParticipantModal";

export default function AdminAirdropListTab() {
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const fetchSchedules = async () => {
    try {
      const res = await apiClient.get("/admin/airdrop/schedules");
      setSchedules(res.data);
    } catch (err) {
      console.error("❌ Gagal fetch jadwal:", err);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Yakin ingin menghapus jadwal ini?");
    if (!confirmDelete) return;

    try {
      await apiClient.post(`/admin/airdrop/schedule/${id}/delete`);
      fetchSchedules();
    } catch (err) {
      console.error("❌ Gagal hapus jadwal:", err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
    <div>
      <div className="mb-3">
        <Button onClick={() => setShowCreate(true)}>➕ Buat Airdrop</Button>
      </div>

      {schedules.length === 0 ? (
        <p>Belum ada jadwal airdrop.</p>
      ) : (
        <Table bordered hover responsive variant="light" className="bg-white text-black">
          <thead>
            <tr>
              <th>#</th>
              <th>Judul</th>
              <th>Jumlah/Orang</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((item, i) => (
              <tr key={item.id}>
                <td>{i + 1}</td>
                <td>{item.title}</td>
                <td>{item.amountPerUser}</td>
                <td>{new Date(item.deadline).toLocaleString()}</td>
                <td>{item.isClosed ? "✅ Closed" : "🕒 Open"}</td>
                <td>
                  <Button
                    size="sm"
                    variant="primary"
                    className="me-1"
                    onClick={() => setSelectedSchedule(item.id)}
                  >
                    Detail
                  </Button>
                  <Button
                    size="sm"
                    variant="warning"
                    className="me-1"
                    onClick={() => setEditingSchedule(item)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(item.id)}
                  >
                    Hapus
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal Buat Airdrop */}
      {showCreate && (
        <AirdropCreateModal
          show={showCreate}
          onClose={() => setShowCreate(false)}
          onCreated={fetchSchedules}
        />
      )}

      {/* Modal Edit Airdrop */}
      {editingSchedule && (
        <AirdropCreateModal
          show={true}
          onClose={() => setEditingSchedule(null)}
          onCreated={fetchSchedules}
          defaultData={editingSchedule}
          mode="edit"
        />
      )}

      {/* Modal Detail Airdrop */}
      {selectedSchedule && (
        <AirdropParticipantModal
          scheduleId={selectedSchedule}
          onClose={() => setSelectedSchedule(null)}
          refreshList={fetchSchedules}
        />
      )}
    </div>
  );
}

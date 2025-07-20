"use client";

import apiClient from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Spinner, Table } from "react-bootstrap";
import AirdropParticipantModal from "./AirdropParticipantModal";

export default function AdminAirdropApprovalTab() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const fetchSchedules = async () => {
    try {
      const res = await apiClient.get("/admin/airdrop/schedules");
      setSchedules(res.data);
    } catch (err) {
      console.error("❌ Gagal fetch jadwal:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
    <div>
      {loading ? (
        <Spinner animation="border" />
      ) : schedules.length === 0 ? (
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
                    onClick={() => setSelectedSchedule(item.id)}
                    variant="success"
                  >
                    Kelola Peserta
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal untuk Approve/Distribute */}
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

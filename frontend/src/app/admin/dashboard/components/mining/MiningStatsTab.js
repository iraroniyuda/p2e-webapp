"use client";

import { getMiningStats } from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Card, Table } from "react-bootstrap";

export default function MiningStatsTab() {
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    try {
      const data = await getMiningStats();
      setStats(data);
    } catch (err) {
      console.error("❌ Gagal memuat statistik mining:", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (!stats) return <p>Memuat statistik...</p>;

  return (
    <Card bg="dark" text="white" className="p-4">
      <h5 className="mb-3">Statistik Harian Mining</h5>
      <p>Total valid click hari ini: <strong>{stats.totalValidClicksToday}</strong></p>

      <h6 className="mt-4">Top 10 Pengguna (klik valid)</h6>
      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>#</th>
            <th>Username</th>
            <th>Email</th>
            <th>Valid Clicks</th>
          </tr>
        </thead>
        <tbody>
          {stats.topUsers.map((u, i) => (
            <tr key={u.userId}>
              <td>{i + 1}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.clickCount}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}

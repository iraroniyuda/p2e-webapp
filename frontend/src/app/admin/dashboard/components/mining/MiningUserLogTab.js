"use client";

import { getUserMiningLog } from "@/services/apiClient";
import { useState } from "react";
import { Button, Card, Form, Table } from "react-bootstrap";

export default function MiningUserLogTab() {
  const [userId, setUserId] = useState("");
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    if (!userId.trim()) return alert("Masukkan User ID terlebih dahulu.");

    setLoading(true);
    try {
      const data = await getUserMiningLog(userId);
      setLogs(data.logs);
      setTotal(data.totalValidClicks);
    } catch (err) {
      console.error("❌ Gagal mengambil log user mining:", err);
      alert("User tidak ditemukan atau belum memiliki mining link.");
    }
    setLoading(false);
  };

  return (
    <Card bg="dark" text="white" className="p-4">
      <h5 className="mb-3">Log Klik Mining Per User</h5>
      <Form className="mb-3 d-flex">
        <Form.Control
          type="text"
          placeholder="Masukkan User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="me-2"
        />
        <Button onClick={handleFetch} disabled={loading}>
          {loading ? "Memuat..." : "Lihat Log"}
        </Button>
      </Form>

      <p>Total valid click: <strong>{total}</strong></p>

      {logs.length > 0 && (
        <Table striped bordered hover variant="dark" size="sm">
          <thead>
            <tr>
              <th>#</th>
              <th>IP</th>
              <th>Valid</th>
              <th>Claimed</th>
              <th>Waktu</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={log.id}>
                <td>{i + 1}</td>
                <td>{log.ip}</td>
                <td>{log.isValid ? "✅" : "❌"}</td>
                <td>{log.claimed ? "✅" : "❌"}</td>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}

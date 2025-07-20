"use client";

import {
  applyFixTransactions,
  getFixTransactionPreview,
} from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Spinner, Table } from "react-bootstrap";

export default function FixTransactionTab() {
  const [loading, setLoading] = useState(true);
  const [fixing, setFixing] = useState(false);
  const [logs, setLogs] = useState([]);

  const fetchPreview = async () => {
    try {
      setLoading(true);
      const res = await getFixTransactionPreview();
      setLogs(res || []);
    } catch (err) {
      alert("Gagal mengambil data transaksi yang belum diproses.");
      console.error("❌ Error preview fix:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFix = async () => {
    try {
      setFixing(true);
      const res = await applyFixTransactions();
      alert(res.message || "Proses perbaikan selesai.");
      await fetchPreview();
    } catch (err) {
      alert("❌ Gagal memperbaiki transaksi.");
      console.error(err);
    } finally {
      setFixing(false);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, []);

  return (
    <div className="text-white">
      <h2 className="text-xl font-bold mb-4">Perbaiki Transaksi Gagal Apply</h2>

      <Button
        variant="success"
        disabled={fixing}
        onClick={handleFix}
        className="mb-3"
      >
        {fixing ? "Memproses..." : "Perbaiki Semua Transaksi Gagal Apply"}
      </Button>

      {loading ? (
        <Spinner animation="border" variant="light" />
      ) : logs.length === 0 ? (
        <p className="text-green-400">Tidak ada transaksi yang perlu diperbaiki.</p>
      ) : (
        <Table striped bordered hover variant="dark">
          <thead>
            <tr>
              <th>ID</th>
              <th>User ID</th>
              <th>Username</th>
              <th>User Level</th>
              <th>Exchanger Level</th>
              <th>Deskripsi</th>
              <th>Jumlah</th>
              <th>Status</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.id}</td>
                <td>{tx.userId}</td>
                <td>{tx.user?.username || "-"}</td>
                <td>{tx.user?.userLevel || "-"}</td>
                <td>{tx.user?.exchangerLevel || "-"}</td>
                <td>{tx.description}</td>
                <td>{parseInt(tx.amount).toLocaleString("id-ID")}</td>
                <td>{tx.status}</td>
                <td>{new Date(tx.createdAt).toLocaleString("id-ID")}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

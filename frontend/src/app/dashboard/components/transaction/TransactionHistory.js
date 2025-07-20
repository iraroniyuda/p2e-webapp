"use client";

import { getUserTransactionHistory } from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";

// Helper format
const formatCurrency = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await getUserTransactionHistory();
      setTransactions(data);
    } catch (error) {
      console.error("❌ Failed to load transaction history:", error);
      alert("Gagal mengambil riwayat transaksi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-6 text-white">
        <Spinner animation="border" variant="light" />
        <div className="mt-2">Memuat transaksi...</div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-6 text-white">
        Belum ada riwayat transaksi.
      </div>
    );
  }

  return (
    <div className="p-4 text-white">
      <h2 className="text-xl font-semibold mb-4">Riwayat Transaksi Top-Up</h2>
      <div className="space-y-4">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="bg-zinc-800 p-4 rounded-lg border border-zinc-600"
          >
            <div className="flex justify-between">
              <div>
                <div className="text-sm text-gray-300">ID Transaksi: {tx.transactionId}</div>
                <div className="text-sm text-gray-400">Metode: {tx.paymentMethod}</div>
                <div className="text-sm text-gray-400">Jumlah: {formatCurrency(tx.amount)}</div>
                <div className="text-sm text-gray-400">Status: <b>{tx.status}</b></div>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Tanggal: {tx.createdAt ? new Date(tx.createdAt).toLocaleString("id-ID") : "Tanggal tidak tersedia"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

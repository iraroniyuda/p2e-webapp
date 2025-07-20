"use client";

import { getSuccessfulTransactionsSummary } from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";

export default function SuccessSummaryTab() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await getSuccessfulTransactionsSummary();
        setSummary(data);
      } catch (err) {
        console.error("❌ Gagal mengambil ringkasan transaksi:", err);
        alert("Gagal mengambil ringkasan transaksi.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="text-center text-white py-6">
        <Spinner animation="border" variant="light" />
        <div className="mt-2">Memuat ringkasan transaksi...</div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-white">
        Tidak ada data tersedia.
      </div>
    );
  }

  const {
    email,
    username,
    userLevel,
    exchangerLevel,
    totalTransactions,
    totalAmount,
    detailPerCategory,
  } = summary;

  return (
    <div className="text-white">
      <h2 className="text-xl font-bold mb-4">Rekap Transaksi Berhasil</h2>

      <div className="mb-6 p-4 bg-zinc-800 rounded-lg border border-zinc-600">
        <p>Email: <strong>{email}</strong></p>
        <p>Username: <strong>{username}</strong></p>
        <p>User Level: <strong>{userLevel}</strong></p>
        <p>Exchanger Level: <strong>{exchangerLevel}</strong></p>
        <p>Total Transaksi Berhasil: <strong>{totalTransactions}</strong></p>
        <p>Total Nilai (Rp): <strong>{totalAmount.toLocaleString("id-ID")}</strong></p>

        <h4 className="text-md font-semibold mt-4 mb-2">Detail per Deskripsi</h4>
        {Object.entries(detailPerCategory).map(([desc, data]) => (
          <div key={desc} className="pl-3 mb-2">
            <p className="font-medium">{desc}</p>
            <p className="text-sm">Jumlah: {data.count} transaksi</p>
            <p className="text-sm">Total: Rp {data.amount.toLocaleString("id-ID")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

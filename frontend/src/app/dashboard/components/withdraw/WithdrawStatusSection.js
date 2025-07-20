"use client";
import { getWithdrawHistory } from "@/services/apiClient";
import { useEffect, useState } from "react";

export default function WithdrawHistorySection() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getWithdrawHistory();
        setHistory(data.history || []);
      } catch (err) {
        console.error("❌ Gagal ambil riwayat:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) return <p className="text-white">Memuat riwayat...</p>;
  if (history.length === 0) return <p className="text-white">Belum ada riwayat withdraw.</p>;

  return (
    <div className="space-y-4 mt-4 text-white">
      <h4 className="font-bold text-white">Riwayat Withdraw</h4>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-700 text-sm">
          <thead>
            <tr className="bg-black text-white">
              <th className="border border-gray-700 p-2">Tanggal</th>
              <th className="border border-gray-700 p-2">Bank</th>
              <th className="border border-gray-700 p-2">Nominal</th>
              <th className="border border-gray-700 p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id} className="bg-black text-white">
                <td className="border border-gray-700 p-2">
                  {new Date(item.createdAt).toLocaleString("id-ID")}
                </td>
                <td className="border border-gray-700 p-2">{item.method || "-"}</td>
                <td className="border border-gray-700 p-2">
                  Rp{Number(item.amount).toLocaleString("id-ID")}
                </td>
                <td className="border border-gray-700 p-2">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

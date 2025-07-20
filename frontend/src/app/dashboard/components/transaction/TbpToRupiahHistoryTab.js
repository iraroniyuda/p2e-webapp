"use client";
import { getTbpToRupiahHistory } from "@/services/apiClient";
import { useEffect, useState } from "react";

export default function TbpToRupiahHistoryTab() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getTbpToRupiahHistory();
        setHistory(data);
      } catch (err) {
        console.error("❌ Gagal ambil riwayat:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date) ? "-" : date.toLocaleString("id-ID");
  };

  const formatTbp = (tbp) => {
    try {
      return Number(tbp).toFixed(2);
    } catch {
      return "-";
    }
  };

  const formatRupiah = (rupiah) => {
    try {
      return "Rp " + Number(rupiah).toLocaleString("id-ID");
    } catch {
      return "-";
    }
  };

  return (
    <div className="p-2">
      <h3 className="text-xl font-semibold mb-3 text-light">Riwayat Konversi TBP ke Rupiah</h3>

      {loading ? (
        <p>⏳ Memuat...</p>
      ) : history.length === 0 ? (
        <p>🚫 Belum ada transaksi.</p>
      ) : (
        <table className="w-full table-auto border border-gray-300 text-sm">
          <thead className="bg-gray-100 text-white">
            <tr>
              <th className="border p-2">Tanggal</th>
              <th className="border p-2">Pengirim TBP</th>
              <th className="border p-2">Penerima TBP</th>
              <th className="border p-2">Nominal TBP</th>
              <th className="border p-2">Nominal Rupiah</th>
            </tr>
          </thead>
            <tbody>
            {history.map((item) => (
                <tr key={item.txHash}>
                <td className="border p-2 text-white">{formatDate(item.time)}</td>
                <td className="border p-2 text-white">{item.from}</td>
                <td className="border p-2 text-white">{item.to}</td>
                <td className="border p-2 text-white">{formatTbp(item.tbp)}</td>
                <td className="border p-2 text-white">{formatRupiah(item.rupiah)}</td>
                </tr>
            ))}
            </tbody>

        </table>
      )}
    </div>
  );
}

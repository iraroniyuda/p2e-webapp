"use client";
import { getConvertRupiahToSbpHistory, getSbpExchangePrice } from "@/services/apiClient";
import { useEffect, useState } from "react";

export default function SbpConvertHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sbpPrice, setSbpPrice] = useState(100);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [hist, price] = await Promise.all([
          getConvertRupiahToSbpHistory(),
          getSbpExchangePrice(),
        ]);
        setHistory(hist);
        setSbpPrice(Number(price));
      } catch (err) {
        console.error("❌ Gagal ambil histori:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return (
    <div className="mt-10 bg-white/90 rounded-xl p-6 shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-white">Riwayat Konversi SBP</h3>

      {loading ? (
        <p>Loading...</p>
      ) : history.length === 0 ? (
        <p>Belum ada riwayat konversi.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-700 border border-gray-300 rounded-xl">
            <thead className="bg-gray-100 text-white">
              <tr>
                <th className="px-4 py-2 border">Tanggal</th>
                <th className="px-4 py-2 border">Jumlah SBP</th>
                <th className="px-4 py-2 border">Rupiah</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => {
                const amount = Number(item.sale || 0);
                const rupiah = Math.ceil(amount * sbpPrice);
                return (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2 border text-white">{new Date(item.createdAt).toLocaleString("id-ID")}</td>
                    <td className="px-4 py-2 border text-white">{amount.toLocaleString("id-ID")} SBP</td>
                    <td className="px-4 py-2 border text-white">{rupiah.toLocaleString("id-ID")} IDR</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

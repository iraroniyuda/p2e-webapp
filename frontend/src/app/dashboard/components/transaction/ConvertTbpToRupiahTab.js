"use client";
import {
  getAllAvailableExchangers,
  getPublicTbpToRupiahRates,
  getWalletByUserId,
  verifyTbpToRupiahConversion,
} from "@/services/apiClient";
import { sendTbpToExchanger, sendTbpToOwner } from "@/services/TokenBridge";
import { useEffect, useState } from "react";

export default function ConvertTbpToRupiahTab() {
  const [amountTbp, setAmountTbp] = useState("");
  const [recipientType, setRecipientType] = useState("company");
  const [availableExchangers, setAvailableExchangers] = useState([]);
  const [selectedExchangerId, setSelectedExchangerId] = useState("");
  const [rate, setRate] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

    useEffect(() => {
    if (recipientType === "exchanger" && amountTbp && rate) {
        fetchExchangers();
    }
    }, [recipientType, amountTbp, rate]);


  useEffect(() => {
    fetchRates();
  }, [recipientType]);

    const fetchExchangers = async () => {
    try {
        const estRupiah = parseFloat(amountTbp || 0) * rate;
        if (!estRupiah || estRupiah <= 0) return;

        const res = await getAllAvailableExchangers(estRupiah, "rupiah");

        setAvailableExchangers(res);
    } catch (err) {
        console.error("❌ Gagal fetch exchanger:", err);
    }
    };

  const fetchRates = async () => {
    try {
      const res = await getPublicTbpToRupiahRates();
      const match = res.find((r) =>
        recipientType === "company"
          ? r.type === "user_to_company"
          : r.type === "user_to_exchanger"
      );
      if (match) setRate(match.rate);
    } catch (err) {
      console.error("❌ Gagal ambil rate:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const tbp = parseFloat(amountTbp);
      if (!tbp || tbp <= 0) {
        setMessage("Jumlah TBP tidak valid.");
        setLoading(false);
        return;
      }

      let txHash;

      if (recipientType === "company") {
        txHash = await sendTbpToOwner(tbp);
      } else {
        if (!selectedExchangerId) {
          setMessage("Pilih exchanger terlebih dahulu.");
          setLoading(false);
          return;
        }
        const data = await getWalletByUserId(selectedExchangerId);
        txHash = await sendTbpToExchanger(data.wallet, tbp);
      }

      await verifyTbpToRupiahConversion({
        amount: tbp,
        txHash,
        recipientType,
        exchangerId: recipientType === "exchanger" ? selectedExchangerId : null,
      });

      setMessage("✅ Kami sedang memproses pengajuan penjualan token anda.");
      setAmountTbp("");
      setSelectedExchangerId("");
    } catch (err) {
      console.error("❌ Error:", err);
      setMessage(err?.response?.data?.error || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-light">Jual TBP ke Rupiah</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="number"
          placeholder="Jumlah TBP"
          value={amountTbp}
          onChange={(e) => setAmountTbp(e.target.value)}
          className="p-2 border rounded w-full"
          min="0"
          required
        />

        <select
          className="p-2 border rounded w-full"
          value={recipientType}
          onChange={(e) => setRecipientType(e.target.value)}
        >
          <option value="company">Ke Perusahaan</option>
          <option value="exchanger">Ke Exchanger</option>
        </select>

        {recipientType === "exchanger" && rate && (
        <select
            className="p-2 border rounded w-full"
            value={selectedExchangerId}
            onChange={(e) => setSelectedExchangerId(e.target.value)}
        >
            <option value="">-- Pilih Exchanger --</option>
            {availableExchangers.map((ex) => (
            <option key={ex.id} value={ex.id}>
                {ex.username} - Tersedia Rp {parseInt(ex.available).toLocaleString("id-ID")}
            </option>
            ))}
        </select>
        )}




        {rate && amountTbp && (
          <p className="text-sm text-white">
            Estimasi: Rp {(parseFloat(amountTbp) * rate).toLocaleString("id-ID")}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 w-full rounded text-white"
          style={{
            backgroundColor: loading ? "#000" : "#28a745",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Memproses..." : "Kirim & Konversi"}
        </button>

        {message && <p className="text-sm text-white bg-red-100 p-3 rounded">{message}</p>}
      </form>
    </div>
  );
}

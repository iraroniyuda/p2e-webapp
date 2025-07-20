"use client";
import { convertRupiahToSbp, getSbpExchangePrice, getUserBalance } from "@/services/apiClient";
import { useEffect, useState } from "react";

export default function SbpExchangeForm() {
  const [sbpInput, setSbpInput] = useState("");
  const [rupiahEstimate, setRupiahEstimate] = useState(null);
  const [sbpPrice, setSbpPrice] = useState(100);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [rupiahBalance, setRupiahBalance] = useState(0);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const price = await getSbpExchangePrice();
        setSbpPrice(Number(price));
      } catch (err) {
        console.error("❌ Gagal ambil harga SBP:", err);
        setSbpPrice(100); // fallback
      }
    };

    const fetchBalance = async () => {
      try {
        const res = await getUserBalance();
        setRupiahBalance(res.rupiah || 0);
      } catch (err) {
        console.error("❌ Gagal ambil saldo:", err);
      }
    };

    fetchConfig();
    fetchBalance();
  }, []);

  useEffect(() => {
    if (!sbpInput || isNaN(sbpInput)) return setRupiahEstimate(null);
    setRupiahEstimate(Number(sbpInput) * sbpPrice);
  }, [sbpInput, sbpPrice]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const res = await convertRupiahToSbp(Number(sbpInput));
      setMessage(res.message || "Penukaran berhasil.");
      setSbpInput("");
    } catch (err) {
      setMessage(err?.response?.data?.error || "Gagal menukar SBP.");
    } finally {
      setLoading(false);
    }
  };

  const buttonStyle = (bgColor, isActive) => ({
    backgroundColor: isActive ? bgColor : "white",
    color: isActive ? "white" : "black",
    border: "1px solid #ced4da",
  });

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-[#1b1464] via-[#3f2b96] to-[#6dd5ed] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8 space-y-5"
      >
        <h2 className="text-2xl font-semibold text-center text-white">Tukar Rupiah ke SBP</h2>

        <div className="text-sm text-white space-y-1">
          <p>Harga SBP saat ini: <strong>{sbpPrice.toLocaleString("id-ID")} IDR</strong></p>
          <p>Saldo rupiah Anda: <strong>{Number(rupiahBalance).toLocaleString("id-ID")} IDR</strong></p>
        </div>

        <input
          type="number"
          min="0"
          step="0.01"
          value={sbpInput}
          onChange={(e) => setSbpInput(e.target.value)}
          placeholder="Jumlah SBP"
          className="w-full p-3 rounded-xl bg-white/80 text-black placeholder-gray-500 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:ring-offset-1 transition-all duration-200"
        />

        {rupiahEstimate !== null && (
          <p className="text-sm text-white text-center">
            Akan dipotong: <strong>{Math.ceil(rupiahEstimate).toLocaleString("id-ID")} IDR</strong>
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !sbpInput}
          className="w-full py-3 rounded-xl font-semibold border transition-all duration-200"
          style={buttonStyle("#007bff", !loading && sbpInput)}
        >
          {loading ? "Memproses..." : "Tukar SBP Sekarang"}
        </button>



        {message && (
          <p className={`text-sm text-center mt-2 ${message.startsWith("Gagal") ? "text-white" : "text-white"}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

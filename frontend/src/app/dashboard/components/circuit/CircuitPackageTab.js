"use client";

import { useAuth } from "@/contexts/AuthContext";
import { buyCircuitOwnerPackage, getPublicCircuitOwnerPackages } from "@/services/apiClient";
import Decimal from "decimal.js";
import { useEffect, useState } from "react";

export default function CircuitPackageTab() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [buying, setBuying] = useState("");
  const { user, refreshUserProfile } = useAuth();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const data = await getPublicCircuitOwnerPackages();
      setPackages(data);
    } catch (err) {
      console.error("❌ Gagal ambil paket:", err);
      setMessage("Gagal memuat paket. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (level) => {
    setMessage("");
    setBuying(level);
    try {
      await buyCircuitOwnerPackage(level);
      await refreshUserProfile();
      setMessage(`✅ Berhasil membeli paket ${level}.`);
    } catch (err) {
      console.error("❌ Gagal beli paket:", err);
      const msg = err?.response?.data?.error || "Gagal membeli paket.";
      setMessage(`❌ ${msg}`);
    } finally {
      setBuying("");
    }
  };

  if (loading) return <div>⏳ Memuat paket...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {message && (
        <div className="text-sm text-white bg-black bg-opacity-60 p-3 rounded col-span-2">
          {message}
        </div>
      )}

      {packages.map((pkg) => (
        <div
          key={pkg.name}
          className="border rounded-lg p-4 bg-white shadow flex flex-col justify-between"
        >
          <div>
            <h3 className="text-xl font-semibold capitalize mb-2">{pkg.name}</h3>
            <p>💰 Harga: {new Decimal(pkg.priceSBP).toFixed()} SBP</p>
            <p>🎁 Cashback: {new Decimal(pkg.cashbackSBP).toFixed()} SBP</p>
            {pkg.description && (
              <p className="text-sm mt-2 text-gray-600">{pkg.description}</p>
            )}
          </div>

          <button
            onClick={() => handleBuy(pkg.name)}
            className="mt-4 px-4 py-2 rounded border"
            style={{
              backgroundColor: buying === pkg.name ? "#6c757d" : "#28a745", // hijau saat normal, abu saat loading
              color: "white",
              borderColor: "#28a745",
              cursor: buying === pkg.name ? "not-allowed" : "pointer",
              opacity: buying === pkg.name ? 0.8 : 1,
            }}
            disabled={buying === pkg.name}
          >
            {buying === pkg.name ? "Memproses..." : `Beli Paket ${pkg.name}`}
          </button>

        </div>
      ))}
    </div>
  );
}

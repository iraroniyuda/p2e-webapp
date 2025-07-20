"use client";

import FingerprintJS from "@fingerprintjs/fingerprintjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MiningLandingPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Mencatat klik referral...");
  const [statusColor, setStatusColor] = useState("text-white");

  useEffect(() => {
    const trackClick = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get("ref");

      if (!ref) {
        setMessage("❌ Kode referral tidak ditemukan.");
        setStatusColor("text-red-500");
        return;
      }

      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const fingerprint = result.visitorId;

        const res = await axios.post("/api/mining/click", {
          ref,
          fingerprint,
        });

        setMessage(`✅ ${res.data.message}`);
        setStatusColor("text-green-400");

        // Redirect ke home setelah 2 detik
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } catch (err) {
        console.error("❌ Gagal mencatat klik:", err);
        setMessage("❌ Gagal mencatat klik.");
        setStatusColor("text-red-500");
      }
    };

    trackClick();
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center p-6">
        <h1 className="text-2xl font-bold mb-4">Referral Mining</h1>
        <p className={`text-lg font-semibold ${statusColor}`}>{message}</p>
      </div>
    </div>
  );
}

"use client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function VerifyPage() {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    if (!token) return;

    fetch(`/api/auth/verify?token=${token}`)
      .then(async (res) => {
        if (res.redirected) {
          // if backend redirect is used
          window.location.href = res.url;
        } else if (res.ok) {
          setStatus("✅ Email verified successfully!");
        } else {
          const data = await res.json();
          setStatus(`❌ ${data.message || "Verification failed."}`);
        }
      })
      .catch(() => setStatus("❌ Something went wrong."));
  }, [token]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px", fontSize: "18px" }}>
      {status}
    </div>
  );
}

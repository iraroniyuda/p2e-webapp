"use client";
import apiClient from "@/services/apiClient";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [lang, setLang] = useState("id");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setLang(localStorage.getItem("lang") || "id");
    }
  }, []);

  const labels = {
    id: {
      title: "Verifikasi Email",
      verifying: "Memverifikasi email Anda...",
      invalid: "❌ Link verifikasi tidak valid.",
      success: "✅ Email Anda berhasil diverifikasi! Anda akan diarahkan ke halaman login...",
      failed: "Gagal verifikasi email. Link mungkin sudah expired atau pernah dipakai.",
      toLogin: "Ke Halaman Login"
    },
    en: {
      title: "Email Verification",
      verifying: "Verifying your email...",
      invalid: "❌ Invalid verification link.",
      success: "✅ Your email has been verified! Redirecting you to login page...",
      failed: "Failed to verify email. The link might be expired or already used.",
      toLogin: "Go to Sign In"
    }
  };

  const t = labels[lang];
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    if (!token || !email) {
      setMsg(t.invalid);
      setLoading(false);
      return;
    }
    apiClient
      .post("/auth/verify-email-link", { email, token })
      .then(() => {
        setMsg(t.success);
        setSuccess(true);
        setTimeout(() => {
          router.push("/signin");
        }, 2500);
      })
      .catch((err) => {
        setMsg(
          err.response?.data?.message ||
          t.failed
        );
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [t.invalid, t.success, t.failed, router, searchParams]);

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow-sm p-4 rounded-4" style={{ maxWidth: 400 }}>
        <h2 className="text-center mb-4">{t.title}</h2>
        {loading ? (
          <p className="text-center">{t.verifying}</p>
        ) : (
          <div className={`alert text-center ${success ? "alert-success" : "alert-danger"}`}>
            {msg}
          </div>
        )}
        {!success && (
          <div className="text-center mt-3">
            <button className="btn btn-primary" onClick={() => router.push("/signin")}>
              {t.toLogin}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

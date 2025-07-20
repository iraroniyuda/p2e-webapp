"use client";
import { forgotPassword } from "@/services/apiClient";
import "bootstrap/dist/css/bootstrap.min.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [lang, setLang] = useState("id");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setLang(localStorage.getItem("lang") || "id");
    }
  }, []);

  const labels = {
    id: {
      title: "Lupa Password",
      label: "Masukkan email yang terdaftar",
      placeholder: "emailkamu@email.com",
      send: "Kirim Link Reset",
      sending: "Mengirim...",
      back: "Kembali ke Halaman Masuk",
      success: "📧 Link reset password telah dikirim ke email kamu.",
      failed: "Gagal mengirim email reset password.",
    },
    en: {
      title: "Forgot Password",
      label: "Enter your registered email",
      placeholder: "your@email.com",
      send: "Send Reset Link",
      sending: "Sending...",
      back: "Back to Sign In",
      success: "📧 Password reset link has been sent to your email.",
      failed: "Failed to send reset password email.",
    }
  };

  const t = labels[lang];

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      await forgotPassword(email);
      setStatus(t.success);
    } catch (err) {
      setStatus(err?.response?.data?.message || t.failed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card p-4 shadow rounded-4" style={{ maxWidth: "400px" }}>
        <h3 className="text-center mb-3">{t.title}</h3>
        {status && <div className="alert alert-info text-center">{status}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">{t.label}</label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder={t.placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? t.sending : t.send}
          </button>
        </form>

        <div className="text-center mt-3">
          <button className="btn btn-link p-0" onClick={() => router.push("/signin")}>
            {t.back}
          </button>
        </div>
      </div>
    </div>
  );
}

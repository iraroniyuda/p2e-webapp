"use client";
import { resetPassword } from "@/services/apiClient";
import "bootstrap/dist/css/bootstrap.min.css";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [lang, setLang] = useState("id");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setLang(localStorage.getItem("lang") || "id");
    }
  }, []);

  const labels = {
    id: {
      title: "Reset Password",
      newPassword: "Password Baru",
      confirmPassword: "Konfirmasi Password",
      newPasswordPlaceholder: "Masukkan password baru",
      confirmPasswordPlaceholder: "Ulangi password",
      resetBtn: "Reset Password",
      resetting: "Resetting...",
      back: "Kembali ke Halaman Masuk",
      success: "✅ Password berhasil direset. Silakan login.",
      notMatch: "❌ Password tidak cocok.",
      fillAll: "⚠️ Harap isi semua field.",
      failed: "Gagal mereset password.",
      invalidLink: "❌ Link reset tidak valid. Silakan cek kembali email kamu.",
    },
    en: {
      title: "Reset Password",
      newPassword: "New Password",
      confirmPassword: "Confirm Password",
      newPasswordPlaceholder: "Enter new password",
      confirmPasswordPlaceholder: "Re-enter password",
      resetBtn: "Reset Password",
      resetting: "Resetting...",
      back: "Back to Sign In",
      success: "✅ Password successfully reset. Please login.",
      notMatch: "❌ Passwords do not match.",
      fillAll: "⚠️ Please fill all fields.",
      failed: "Failed to reset password.",
      invalidLink: "❌ Invalid reset link. Please check your email again.",
    }
  };

  const t = labels[lang];

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!newPassword || !confirmPassword) {
      setStatus(t.fillAll);
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus(t.notMatch);
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ email, token, newPassword });
      setStatus(t.success);
      setTimeout(() => router.push("/signin"), 2500);
    } catch (err) {
      setStatus(err?.response?.data?.message || t.failed);
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div className="alert alert-danger shadow rounded-3 text-center">
          {t.invalidLink}
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card p-4 shadow rounded-4" style={{ maxWidth: "400px" }}>
        <h3 className="text-center mb-3">{t.title}</h3>
        {status && <div className="alert alert-info text-center">{status}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">{t.newPassword}</label>
            <input
              type="password"
              className="form-control"
              placeholder={t.newPasswordPlaceholder}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">{t.confirmPassword}</label>
            <input
              type="password"
              className="form-control"
              placeholder={t.confirmPasswordPlaceholder}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-success w-100" disabled={loading}>
            {loading ? t.resetting : t.resetBtn}
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

"use client";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/services/apiClient";
import "bootstrap/dist/css/bootstrap.min.css";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function SignInPage() {
  const router = useRouter();
  const { login, user, loading } = useAuth();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Untuk resend link
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");
  const resendTimeout = useRef(null);

  // Ambil lang dari localStorage
  const [lang, setLang] = useState("id");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setLang(localStorage.getItem("lang") || "id");
    }
  }, []);

  const labels = {
    id: {
      signIn: "Masuk",
      emailOrUsername: "Email atau Username",
      emailOrUsernamePlaceholder: "Masukkan email atau username",
      password: "Password",
      passwordPlaceholder: "Masukkan password Anda",
      forgot: "Lupa Password?",
      signInBtn: "Masuk",
      signingIn: "Sedang masuk...",
      noAccount: "Belum punya akun?",
      register: "Daftar",
      resendLink: "Kirim Ulang Link Verifikasi",
      resending: "Mengirim ulang...",
      resendSuccess: "✅ Link verifikasi telah dikirim ulang ke email Anda. Silakan cek inbox dan folder spam.",
      errorSuspended: "🚫 Akun Anda telah ditangguhkan. Hubungi admin untuk reaktivasi.",
      errorNotVerified: "📭 Email Anda belum diverifikasi. Silakan cek email Anda.",
      errorWrong: "❌ Email atau password salah.",
      errorUserNotFound: "❌ Pengguna tidak ditemukan.",
      errorDefault: "Login gagal. Silakan coba lagi.",
      forgotPasswordRoute: "/forgot-password",
      registerRoute: "/register",
    },
    en: {
      signIn: "Sign In",
      emailOrUsername: "Email or Username",
      emailOrUsernamePlaceholder: "Enter email or username",
      password: "Password",
      passwordPlaceholder: "Enter your password",
      forgot: "Forgot Password?",
      signInBtn: "Sign In",
      signingIn: "Signing in...",
      noAccount: "Don't have an account?",
      register: "Register",
      resendLink: "Resend Verification Link",
      resending: "Resending...",
      resendSuccess: "✅ Verification link has been resent to your email. Please check your inbox and spam folder.",
      errorSuspended: "🚫 Your account has been suspended. Please contact admin to reactivate.",
      errorNotVerified: "📭 Your email is not verified. Please check your email.",
      errorWrong: "❌ Incorrect email or password.",
      errorUserNotFound: "❌ User not found.",
      errorDefault: "Login failed. Please try again.",
      forgotPasswordRoute: "/forgot-password",
      registerRoute: "/register",
    },
  };

  const t = labels[lang];

  // Redirect otomatis jika sudah login
  useEffect(() => {
    if (!loading && user) {
      window.location.href = user.role === "admin" ? "/admin/dashboard" : "/dashboard";
    }
  }, [user, loading]);

  useEffect(() => {
    if (resendSuccess) {
      resendTimeout.current = setTimeout(() => {
        setShowResend(false);
        setResendSuccess("");
      }, 5000);
    }
    return () => clearTimeout(resendTimeout.current);
  }, [resendSuccess]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  // Helper: cek error belum verifikasi
  function isNotVerified(rawMessage = "") {
    const str = rawMessage.toLowerCase();
    return (
      str.includes("not verified") ||
      str.includes("belum diverifikasi") ||
      str.includes("email belum diverifikasi")
    );
  }

  const handleSignIn = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    setShowResend(false);
    setResendSuccess("");

    try {
      const user = await login(form.identifier, form.password);
      if (user.role === "admin") router.push("/admin/dashboard");
      else router.push("/dashboard");
    } catch (err) {
      const rawMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        t.errorDefault;

      if (rawMessage.toLowerCase().includes("ditangguhkan")) {
        setError(t.errorSuspended);
      } else if (isNotVerified(rawMessage)) {
        setError(t.errorNotVerified);
        setShowResend(true);
      } else if (
        rawMessage.toLowerCase().includes("invalid credentials") ||
        rawMessage.toLowerCase().includes("credential salah")
      ) {
        setError(t.errorWrong);
      } else if (rawMessage.toLowerCase().includes("user not found")) {
        setError(t.errorUserNotFound);
      } else {
        setError(rawMessage);
      }
    } finally {
      setFormLoading(false);
    }
  };

  // Resend verification link
  const handleResendLink = async () => {
    setResendLoading(true);
    setResendSuccess("");
    try {
      if (!form.identifier) throw new Error(t.emailOrUsernamePlaceholder);
      await apiClient.post("/auth/resend-verification-link", {
        identifier: form.identifier,
      });
      setResendSuccess(t.resendSuccess);
    } catch (err) {
      setResendSuccess(
        err?.response?.data?.message ||
        err?.message ||
        t.errorDefault
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow-sm p-4 rounded-4" style={{ maxWidth: "400px" }}>
        <h2 className="text-center mb-4">{t.signIn}</h2>

        {/* ALERT ERROR / RESEND */}
        {error && (
          <div className="alert alert-danger text-center">
            <span>{error}</span>
            {showResend && (
              <div className="mt-3 d-flex flex-column align-items-center">
                <button
                  className="btn btn-warning btn-sm"
                  onClick={handleResendLink}
                  disabled={resendLoading || !form.identifier}
                  style={{ minWidth: 200 }}
                >
                  {resendLoading ? t.resending : t.resendLink}
                </button>
              </div>
            )}
          </div>
        )}
        {resendSuccess && (
          <div className="alert alert-info text-center">{resendSuccess}</div>
        )}

        <form onSubmit={handleSignIn} noValidate>
          <div className="mb-3">
            <label htmlFor="identifier" className="form-label">{t.emailOrUsername}</label>
            <input
              id="identifier"
              type="text"
              name="identifier"
              className="form-control"
              placeholder={t.emailOrUsernamePlaceholder}
              value={form.identifier}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="mb-3 position-relative">
            <label htmlFor="password" className="form-label">{t.password}</label>
            <div className="input-group">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-control"
                placeholder={t.passwordPlaceholder}
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={togglePasswordVisibility}
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-end mb-3">
            <button
              type="button"
              className="btn btn-link p-0 text-decoration-none"
              onClick={() => router.push(t.forgotPasswordRoute)}
              style={{ fontSize: "0.875rem" }}
            >
              {t.forgot}
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={formLoading}
          >
            {formLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {t.signingIn}
              </>
            ) : (
              t.signInBtn
            )}
          </button>
        </form>

        <div className="text-center mt-3">
          <p className="small">
            {t.noAccount}{" "}
            <button
              className="btn btn-link p-0"
              onClick={() => router.push(t.registerRoute)}
            >
              {t.register}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

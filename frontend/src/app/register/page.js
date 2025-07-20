"use client";
import apiClient from "@/services/apiClient";
import "bootstrap/dist/css/bootstrap.min.css";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EyeFill, EyeSlashFill } from "react-bootstrap-icons";

export default function Register() {
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
      title: "Daftar",
      username: "Username",
      email: "Email",
      password: "Password",
      confirmPassword: "Konfirmasi Password",
      referral: "Kode Referral (Opsional)",
      agree: "Saya setuju dengan ",
      terms: "syarat & ketentuan",
      registering: "Mendaftar...",
      register: "Daftar",
      already: "Sudah punya akun?",
      signIn: "Masuk",
      success: "Registrasi berhasil! Silakan cek email Anda dan klik link verifikasi untuk mengaktifkan akun.",
      mustAgree: "Anda harus menyetujui syarat & ketentuan.",
      notMatch: "Password dan konfirmasi tidak cocok.",
      errorDefault: "Registrasi gagal.",
      placeholderUsername: "Masukkan username",
      placeholderEmail: "Masukkan email Anda",
      placeholderPassword: "Masukkan password",
      placeholderConfirmPassword: "Ulangi password",
      placeholderReferral: "Kode referral (opsional)",
    },
    en: {
      title: "Register",
      username: "Username",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      referral: "Referral Code (Optional)",
      agree: "I agree to the ",
      terms: "terms and conditions",
      registering: "Registering...",
      register: "Register",
      already: "Already have an account?",
      signIn: "Sign In",
      success: "Registration successful! Please check your email and click the verification link to activate your account.",
      mustAgree: "You must agree to the terms.",
      notMatch: "Passwords do not match.",
      errorDefault: "Registration failed.",
      placeholderUsername: "Enter your username",
      placeholderEmail: "Enter your email",
      placeholderPassword: "Enter password",
      placeholderConfirmPassword: "Repeat your password",
      placeholderReferral: "Referral code (optional)",
    },
  };

  const t = labels[lang];

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    referral: ""
  });

  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false
  });

  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const referralCode = searchParams.get("referral");
    const savedForm = sessionStorage.getItem("registerForm");
    if (savedForm) {
      const parsed = JSON.parse(savedForm);
      setForm(parsed);
      setAgree(parsed.agree || false);
    }
    if (referralCode) {
      setForm((prev) => ({ ...prev, referral: referralCode }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      sessionStorage.setItem("registerForm", JSON.stringify({ ...updated, agree }));
      return updated;
    });
  };

  const handleTogglePassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!agree) {
      setLoading(false);
      return setError(t.mustAgree);
    }
    if (form.password !== form.confirmPassword) {
      setLoading(false);
      return setError(t.notMatch);
    }

    try {
      await apiClient.post("/auth/register", {
        username: form.username,
        email: form.email,
        password: form.password,
        referral: form.referral || undefined,
      });
      setSuccessMsg(t.success);
      sessionStorage.removeItem("registerForm");
    } catch (err) {
      setError(err.response?.data?.error || t.errorDefault);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow-sm p-4 rounded-4" style={{ maxWidth: "400px" }}>
        <h2 className="text-center mb-4">{t.title}</h2>
        {error && <div className="alert alert-danger text-center">{error}</div>}

        {/* === Sukses Message === */}
        {successMsg && (
          <div className="alert alert-success text-center">{successMsg}</div>
        )}

        {!successMsg && (
          <form onSubmit={handleRegister} noValidate>
            <div className="mb-3">
              <label className="form-label">{t.username}</label>
              <input
                type="text"
                name="username"
                className="form-control"
                value={form.username}
                onChange={handleChange}
                required
                placeholder={t.placeholderUsername}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">{t.email}</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={form.email}
                onChange={handleChange}
                required
                placeholder={t.placeholderEmail}
              />
            </div>

            {["password", "confirmPassword"].map((field) => (
              <div key={field} className="mb-3">
                <label className="form-label">
                  {field === "password" ? t.password : t.confirmPassword}
                </label>
                <div className="input-group">
                  <input
                    type={showPassword[field] ? "text" : "password"}
                    name={field}
                    className="form-control"
                    value={form[field]}
                    onChange={handleChange}
                    required
                    placeholder={field === "password" ? t.placeholderPassword : t.placeholderConfirmPassword}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => handleTogglePassword(field)}
                  >
                    {showPassword[field] ? <EyeSlashFill /> : <EyeFill />}
                  </button>
                </div>
              </div>
            ))}

            <div className="mb-3">
              <label className="form-label">{t.referral}</label>
              <input
                type="text"
                name="referral"
                className="form-control"
                value={form.referral}
                onChange={handleChange}
                placeholder={t.placeholderReferral}
              />
            </div>

            <div className="form-check mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="agree"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="agree">
                {t.agree}
                <a style={{ cursor: "pointer" }} onClick={() => router.push("/eula")}>
                  {t.terms}
                </a>
              </label>
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? t.registering : t.register}
            </button>
          </form>
        )}

        <div className="text-center mt-3">
          <p className="small">
            {t.already}{" "}
            <button
              className="btn btn-link p-0"
              onClick={() => router.push("/signin")}
            >
              {t.signIn}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

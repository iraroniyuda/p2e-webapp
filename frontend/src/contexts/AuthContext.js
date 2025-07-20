"use client";
import apiClient from "@/services/apiClient";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

// Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

useEffect(() => {
  console.log("🚀 AuthContext mounted. Checking token...");

  const token = localStorage.getItem("jwt_token");
  console.log("📦 Found token in localStorage:", token);

  if (token) {
    // ✅ SET DULU BARU panggil loadUserProfile
    // apiClient.defaults.headers.Authorization = `Bearer ${token}`;
    refreshUserProfile();
  } else {
    setLoading(false);
  }
}, []);

  // 🔁 Fungsi ambil profil dari token
  const refreshUserProfile = async () => {
    try {
      const token = localStorage.getItem("jwt_token");
      if (!token) {
        setUser(null);
        return;
      }

      apiClient.defaults.headers.Authorization = `Bearer ${token}`;
      const response = await apiClient.get("/auth/profile");
      console.log("🔄 Profile di-refresh:", response.data.user); 
      setUser(response.data.user);
    } catch (err) {
      console.error("❌ Gagal ambil profil:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const redirectTo = (path) => router.push(path);

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem("jwt_token");
      if (!token) {
        setUser(null);
        return;
      }

      // ✅ Tambahkan baris ini agar apiClient pakai token lagi
      apiClient.defaults.headers.Authorization = `Bearer ${token}`;

      const response = await apiClient.get("/auth/profile");
      setUser(response.data.user);
    } catch (err) {
      console.error("❌ Gagal ambil profil:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };


  const login = async (identifier, password) => {
    try {
      const response = await apiClient.post("/auth/login", { identifier, password });
      const token = response.data.token;

      localStorage.setItem("jwt_token", token);
      apiClient.defaults.headers.Authorization = `Bearer ${token}`;

      const profile = await apiClient.get("/auth/profile");
      const userData = profile.data.user;
      setUser(userData);

      // ⛔ Jangan redirect di sini lagi
      return userData;
      } catch (err) {
    const errorMessage =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      "Login failed";

    console.error("❌ Login error in context:", errorMessage);
    throw new Error(errorMessage);
  }

  };



  const logout = () => {
    localStorage.removeItem("jwt_token");
    apiClient.defaults.headers.Authorization = null;
    setUser(null);
    redirectTo("/signin");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUserProfile }}>
      {!loading ? children : <div className="min-h-screen flex items-center justify-center">Loading...</div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

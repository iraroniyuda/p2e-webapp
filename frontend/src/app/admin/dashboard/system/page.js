"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import AdminSidebar from "../components/AdminSidebar";

export default function SystemSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();

  // State untuk Pengaturan Sistem
  const [systemSettings, setSystemSettings] = useState({
    platformName: "",
    logoUrl: "/images/logo.png",
    contactEmail: "",
    contactPhone: "+1234567890",
  });

  // State untuk Pengaturan Email (SMTP)
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUser: "your-email@gmail.com",
    smtpPassword: "your-email-password",
  });

  // State untuk Monitoring Server (Dummy Data)
  const [serverStatus, setServerStatus] = useState({
    cpuUsage: "20%",
    ramUsage: "4 GB / 16 GB",
    storageUsage: "50 GB / 200 GB",
    uptime: "12 Days 4 Hours",
  });

  // State untuk Maintenance Mode
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Fungsi untuk Mengubah Pengaturan Sistem
  const handleSystemChange = (field, value) => {
    setSystemSettings((prev) => ({ ...prev, [field]: value }));
  };

  // Fungsi untuk Mengubah Pengaturan Email (SMTP)
  const handleEmailChange = (field, value) => {
    setEmailSettings((prev) => ({ ...prev, [field]: value }));
  };

  // Fungsi untuk Menyimpan Pengaturan Maintenance Mode
  const toggleMaintenanceMode = () => {
    setMaintenanceMode((prev) => !prev);
    alert(`Maintenance Mode ${!maintenanceMode ? "Diaktifkan" : "Dinonaktifkan"}`);
  };

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="d-flex"
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/images/bg-dashboard.png')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <AdminSidebar />
      <div className="flex-grow-1 p-4 text-white">
        <h1>Pengaturan Sistem</h1>

        {/* Section 1: Pengaturan Sistem */}
        <div className="mb-4">
          <h2>Pengaturan Sistem</h2>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nama Platform</Form.Label>
              <Form.Control
                type="text"
                value={systemSettings.platformName}
                onChange={(e) => handleSystemChange("platformName", e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>URL Logo</Form.Label>
              <Form.Control
                type="text"
                value={systemSettings.logoUrl}
                onChange={(e) => handleSystemChange("logoUrl", e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email Kontak</Form.Label>
              <Form.Control
                type="email"
                value={systemSettings.contactEmail}
                onChange={(e) => handleSystemChange("contactEmail", e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nomor Telepon Kontak</Form.Label>
              <Form.Control
                type="text"
                value={systemSettings.contactPhone}
                onChange={(e) => handleSystemChange("contactPhone", e.target.value)}
              />
            </Form.Group>
            <Button variant="primary">Simpan Pengaturan Sistem</Button>
          </Form>
        </div>

        {/* Section 2: Pengaturan Email (SMTP) */}
        <div className="mb-4">
          <h2>Pengaturan Email (SMTP)</h2>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>SMTP Host</Form.Label>
              <Form.Control
                type="text"
                value={emailSettings.smtpHost}
                onChange={(e) => handleEmailChange("smtpHost", e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>SMTP Port</Form.Label>
              <Form.Control
                type="number"
                value={emailSettings.smtpPort}
                onChange={(e) => handleEmailChange("smtpPort", e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email Pengirim</Form.Label>
              <Form.Control
                type="text"
                value={emailSettings.smtpUser}
                onChange={(e) => handleEmailChange("smtpUser", e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password SMTP</Form.Label>
              <Form.Control
                type="password"
                value={emailSettings.smtpPassword}
                onChange={(e) => handleEmailChange("smtpPassword", e.target.value)}
              />
            </Form.Group>
            <Button variant="primary">Simpan Pengaturan Email</Button>
          </Form>
        </div>



        {/* Section 4: Maintenance Mode */}
        <div className="mb-4">
          <h2>Pengaturan Maintenance Mode</h2>
          <Button
            variant={maintenanceMode ? "danger" : "primary"}
            onClick={toggleMaintenanceMode}
          >
            {maintenanceMode ? "Nonaktifkan Maintenance Mode" : "Aktifkan Maintenance Mode"}
          </Button>
        </div>
      </div>
    </div>
  );
}

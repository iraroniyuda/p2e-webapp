"use client";

import { useAuth } from "@/contexts/AuthContext";
import apiClient, {
  getReferralSignupBonusConfig,
  getSignupBonusConfig,
  updateReferralSignupBonusConfig,
  updateSignupBonusConfig,
} from "@/services/apiClient";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import AdminSidebar from "../components/AdminSidebar";

export default function ReferralManagementPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [referralSettings, setReferralSettings] = useState([]);
  const [referralTree, setReferralTree] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [marginLeft, setMarginLeft] = useState("0px");
  const [signupBonusConfig, setSignupBonusConfig] = useState({
    bonusPerSignup: "",
    maxDailyBonus: "",
    maxTotalBonus: "",
    isOpen: false,
  });
  const [savingSignupBonus, setSavingSignupBonus] = useState(false);
  const [signupSbpConfig, setSignupSbpConfig] = useState({ sbpAmount: "" });
  const [savingSignupSbp, setSavingSignupSbp] = useState(false);


  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      if (typeof window !== "undefined") router.push("/signin");
    }
  }, [user, loading]);

  useEffect(() => {
    fetchReferralSettings();
    fetchReferralTree();
    fetchSignupBonusConfig();
    fetchSignupSbpConfig();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setMarginLeft(window.innerWidth >= 768 ? "220px" : "0px");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchReferralSettings = async () => {
    try {
      const res = await apiClient.get("/referral/settings");
      setReferralSettings(res.data);
    } catch (err) {
      console.error("❌ Gagal ambil referral settings:", err);
      setError("Gagal memuat pengaturan referral.");
    }
  };

  const fetchReferralTree = async () => {
    try {
      const res = await apiClient.get("/referral/tree?maxLevel=5");
      setReferralTree(res.data);
    } catch (err) {
      console.error("❌ Gagal ambil referral tree:", err);
      setError("Gagal memuat struktur referral.");
    }
  };

  const fetchSignupBonusConfig = async () => {
    try {
      const config = await getReferralSignupBonusConfig();
      setSignupBonusConfig({
        bonusPerSignup: config?.bonusPerSignup ?? "",
        maxDailyBonus: config?.maxDailyBonus ?? "",
        maxTotalBonus: config?.maxTotalBonus ?? "",
        isOpen: config?.isOpen ?? false,
      });
    } catch (err) {
      console.error("❌ Gagal ambil konfigurasi signup bonus:", err);
    }
  };

  const saveSignupBonusConfig = async () => {
    setSavingSignupBonus(true);
    try {
      await updateReferralSignupBonusConfig(signupBonusConfig);
      alert("✅ Konfigurasi bonus signup berhasil disimpan.");
      fetchSignupBonusConfig();
    } catch (err) {
      console.error("❌ Gagal simpan konfigurasi:", err);
      alert("Gagal menyimpan konfigurasi bonus signup.");
    } finally {
      setSavingSignupBonus(false);
    }
  };

  const fetchSignupSbpConfig = async () => {
  try {
    const config = await getSignupBonusConfig();
    setSignupSbpConfig({
      sbpAmount: config?.sbpAmount ?? "",
    });
  } catch (err) {
    console.error("❌ Gagal ambil konfigurasi SBP signup:", err);
  }
};

  const saveSignupSbpConfig = async () => {
    setSavingSignupSbp(true);
    try {
      await updateSignupBonusConfig(signupSbpConfig);
      alert("✅ Konfigurasi bonus SBP signup berhasil disimpan.");
      fetchSignupSbpConfig();
    } catch (err) {
      console.error("❌ Gagal simpan konfigurasi:", err);
      alert("Gagal menyimpan konfigurasi bonus SBP signup.");
    } finally {
      setSavingSignupSbp(false);
    }
  };


  const addReferralLevel = () => {
    const nextLevel = referralSettings.length > 0
      ? Math.max(...referralSettings.map((s) => s.level)) + 1
      : 1;
    setReferralSettings([...referralSettings, { level: nextLevel }]);
  };

  const deleteReferralLevel = (index) => {
    const updated = [...referralSettings];
    updated.splice(index, 1);
    setReferralSettings(updated);
  };

  const saveSettings = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = referralSettings.map((s) => ({
        level: s.level,
        bonusPercentage: s.bonusPercentage ?? 0,
      }));

      await apiClient.post("/referral/settings", payload);
      alert("✅ Pengaturan berhasil disimpan.");
      fetchReferralSettings();
    } catch (err) {
      console.error("❌ Gagal simpan:", err);
      setError("Gagal menyimpan pengaturan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" />
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
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div
        className="flex-grow-1 p-4 text-white"
        style={{ marginLeft, transition: "margin-left 0.3s ease" }}
      >
        <button
          className="btn btn-primary d-md-none mb-3"
          onClick={() => setSidebarOpen(true)}
        >
          ☰ Menu
        </button>

        <h1 className="mb-4 text-2xl font-bold">Manajemen Referral</h1>

        <h2>Level Referral</h2>
        <Card className="p-3 mb-4 bg-dark text-white">
          {error && <div className="alert alert-danger">{error}</div>}

          {[...referralSettings]
            .sort((a, b) => a.level - b.level)
            .map((setting, index) => (
            <Row key={index} className="mb-2 align-items-center">
              <Col xs={8}>
                <p className="mb-0">Level {setting.level}</p>
              </Col>
              <Col xs={4} className="d-flex justify-content-end">
                <Button variant="danger" onClick={() => deleteReferralLevel(index)}>
                  Hapus
                </Button>
              </Col>
            </Row>
          ))}

          <div className="d-flex gap-2 mt-3">
            <Button variant="success" onClick={addReferralLevel}>Tambah Level</Button>
            <Button variant="primary" onClick={saveSettings} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Pengaturan"}
            </Button>
          </div>
        </Card>



        <h2 className="mt-5">Bonus Referral Saat Signup</h2>
        <Card className="p-3 bg-dark text-white">
          <Row className="mb-3">
            <Col md={4}>Bonus Per Signup (SBP)</Col>
            <Col md={8}>
              <input
                type="number"
                className="form-control"
                value={signupBonusConfig.bonusPerSignup}
                onChange={(e) =>
                  setSignupBonusConfig((prev) => ({
                    ...prev,
                    bonusPerSignup: e.target.value,
                  }))
                }
              />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={4}>Max Bonus Harian (SBP)</Col>
            <Col md={8}>
              <input
                type="number"
                className="form-control"
                placeholder="Kosongkan jika tidak dibatasi"
                value={signupBonusConfig.maxDailyBonus}
                onChange={(e) =>
                  setSignupBonusConfig((prev) => ({
                    ...prev,
                    maxDailyBonus: e.target.value,
                  }))
                }
              />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={4}>Max Total Bonus (SBP)</Col>
            <Col md={8}>
              <input
                type="number"
                className="form-control"
                placeholder="Kosongkan jika tidak dibatasi"
                value={signupBonusConfig.maxTotalBonus}
                onChange={(e) =>
                  setSignupBonusConfig((prev) => ({
                    ...prev,
                    maxTotalBonus: e.target.value,
                  }))
                }
              />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={4}>Abaikan Limit Bonus?</Col>
            <Col md={8}>
              <Form.Check
                type="switch"
                id="isOpen"
                label="Beri bonus tanpa batas harian / total"
                checked={signupBonusConfig.isOpen}
                onChange={(e) =>
                  setSignupBonusConfig((prev) => ({
                    ...prev,
                    isOpen: e.target.checked,
                  }))
                }
              />
            </Col>
          </Row>
          <Button
            variant="primary"
            onClick={saveSignupBonusConfig}
            disabled={savingSignupBonus}
          >
            {savingSignupBonus ? "Menyimpan..." : "Simpan Konfigurasi"}
          </Button>
        </Card>

        <h2 className="mt-5">Bonus SBP Saat Buat Akun Baru</h2>
        <Card className="p-3 bg-dark text-white">
          <Row className="mb-3">
            <Col md={4}>Jumlah Bonus SBP</Col>
            <Col md={8}>
              <input
                type="number"
                className="form-control"
                value={signupSbpConfig.sbpAmount}
                onChange={(e) =>
                  setSignupSbpConfig((prev) => ({
                    ...prev,
                    sbpAmount: e.target.value,
                  }))
                }
              />
            </Col>
          </Row>
          <Button
            variant="primary"
            onClick={saveSignupSbpConfig}
            disabled={savingSignupSbp}
          >
            {savingSignupSbp ? "Menyimpan..." : "Simpan Konfigurasi"}
          </Button>
        </Card>

      </div>
    </div>
  );
}

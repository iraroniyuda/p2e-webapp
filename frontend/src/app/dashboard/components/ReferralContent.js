"use client";
import apiClient from "@/services/apiClient";
import { useEffect, useState } from "react";

export default function ReferralContent({ username }) {
  const [referralCode, setReferralCode] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [upline, setUpline] = useState("");
  const [downlines, setDownlines] = useState([]);
  const [customReferral, setCustomReferral] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState("");

  const [bonusSummary, setBonusSummary] = useState({
    totalDownlines: 0,
    totalToday: 0,
    totalAllTime: 0,
  });

  useEffect(() => {
    fetchReferralData();
    fetchBonusSummary();
  }, []);

  const fetchReferralData = async () => {
    try {
      setError(null);

      const [{ data: treeData }, { data: linkData }] = await Promise.all([
        apiClient.get("/referral/tree"),
        apiClient.get("/referral/link"),
      ]);

      setUpline(treeData.upline || "Tidak Ada Upline");

      const formattedDownlines = Array.isArray(treeData.downlines)
        ? formatDownlines(treeData.downlines, 1).sort((a, b) => a.level - b.level)
        : [];
      setDownlines(formattedDownlines);

      setReferralCode(linkData.referralCode || "");
      setReferralLink(linkData.referralLink || "");
    } catch (err) {
      setError("Gagal memuat data referral.");
    }
  };

  const fetchBonusSummary = async () => {
    try {
      const { data } = await apiClient.get("/user/referral-signup/my-log-summary");
      setBonusSummary(data);
    } catch (err) {
      console.error("❌ Gagal ambil summary bonus referral:", err);
    }
  };

  const formatDownlines = (list, level) => {
    return list.flatMap((downline) => {
      if (typeof downline === "string") {
        return [{ username: downline, level }];
      } else if (typeof downline === "object") {
        const current = { username: downline.username || "Unknown", level };
        const subs = Array.isArray(downline.subDownlines)
          ? formatDownlines(downline.subDownlines, level + 1)
          : [];
        return [current, ...subs];
      }
      return [];
    });
  };

  const createReferralCode = async () => {
    if (customReferral.length < 4 || customReferral.length > 8) {
      setError("Kode referral harus 4-8 karakter.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data } = await apiClient.post("/referral/create", {
        referralCode: customReferral.toUpperCase(),
      });

      setReferralCode(data.referralCode);
      setReferralLink(data.referralLink);
      setCustomReferral("");
      fetchReferralData();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal membuat kode referral.");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopySuccess("Link berhasil disalin!");
    } catch {
      setCopySuccess("Gagal menyalin link.");
    } finally {
      setTimeout(() => setCopySuccess(""), 2000);
    }
  };

  const ReferralBonusSummary = () => (
    <div className="mt-3 p-3 border rounded bg-dark text-white">
      <h5 className="mb-2">Registration Bonus Earnings</h5>
      <ul className="mb-0">
        <li>Number of downlines eligible for bonuses: {bonusSummary.totalDownlines}</li>
        <li>Today Bonus: {bonusSummary.totalToday} SBP</li>
        <li>Total Bonus: {bonusSummary.totalAllTime} SBP</li>
      </ul>
    </div>
  );

  return (
    <div className="container mt-5 text-white">
      <h2 className="mb-4">Sistem Referral - {username}</h2>
      <div className="card shadow-sm p-4 rounded-4">
        {referralCode ? (
          <>
            <h4>Your Referral Code</h4>
            <p className="text-primary">{referralCode}</p>

            <h5>Your Referral Link</h5>
            <div className="input-group mb-3">
              <input type="text" className="form-control" value={referralLink} readOnly />
              <button className="btn btn-success" onClick={copyLink}>
                Copy Link
              </button>
            </div>
            {copySuccess && <div className="alert alert-success">{copySuccess}</div>}

            <ReferralBonusSummary />
          </>
        ) : (
          <>
            <h4>Enter Your Referral COde</h4>
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Masukkan kode referral (4-8 karakter)"
                value={customReferral}
                onChange={(e) => setCustomReferral(e.target.value.toUpperCase())}
              />
              <button
                className="btn btn-primary"
                onClick={createReferralCode}
                disabled={loading || customReferral.length < 4 || customReferral.length > 8}
              >
                {loading ? "Creating..." : "Create Referral"}
              </button>
            </div>
          </>
        )}

        {error && <div className="alert alert-danger">{error}</div>}

        <h5 className="mt-4">Your Upline</h5>
        <p>{upline}</p>

        <h5>Your Downline (Multi-Level)</h5>
        {downlines.length > 0 ? (
          <div className="table-responsive mt-3">
            <table className="table table-bordered table-striped table-dark">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Username</th>
                  <th>Generation</th>
                </tr>
              </thead>
              <tbody>
                {downlines.map((d, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{d.username}</td>
                    <td>{d.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted">No Downline</p>
        )}
      </div>
    </div>
  );
}

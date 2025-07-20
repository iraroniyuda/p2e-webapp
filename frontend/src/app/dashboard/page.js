"use client";
import { useAuth } from "@/contexts/AuthContext";
import apiClient, { getUserActivationProgress } from "@/services/apiClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import CardItem from "./components/CardItem";
import DashboardLayout from "./components/DashboardLayout";
import UserInfoCard from "./components/UserInfoCard";

function LoadingPage() {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Spinner animation="border" variant="primary" />
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [downlines, setDownlines] = useState([]);
  const [userActivationProgress, setUserActivationProgress] = useState(null);
  const [hasSubmittedKyc, setHasSubmittedKyc] = useState(false);

  const [stats, setStats] = useState({
    tbpBalance: null,
    transactionCount: null,
    totalWithdrawals: null,
    transactionValue: null,
    raceCount: null,
  });

  useEffect(() => {
    if (!loading && !user) router.push("/signin");
    if (!loading && user?.role === "admin") router.push("/admin/dashboard");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchReferralData();
      fetchUserStats();
      fetchActivationProgress();
      fetchKycStatus();
    }
  }, [user]);

  const fetchReferralData = async () => {
    try {
      const { data: treeData } = await apiClient.get("/referral/tree");
      setDownlines(treeData.downlines || []);
    } catch (err) {
      console.error("❌ Failed to fetch referral data:", err);
    }
  };

  const fetchUserStats = async () => {
    try {
      const { data } = await apiClient.get("/user/dashboard-stats");
      setStats({
        tbpBalance: data.tbpBalance,
        transactionCount: data.transactionCount,
        totalWithdrawals: data.totalWithdrawals,
        transactionValue: data.transactionValue,
        raceCount: data.raceCount,
      });
    } catch (err) {
      console.error("❌ Failed to fetch user stats:", err);
    }
  };

  const fetchActivationProgress = async () => {
    try {
      const progress = await getUserActivationProgress();
      setUserActivationProgress(progress);
    } catch (err) {
      console.error("❌ Failed to fetch activation progress:", err);
      setUserActivationProgress(null);
    }
  };

  const fetchKycStatus = async () => {
    try {
      const res = await apiClient.get("/kyc/status");
      setHasSubmittedKyc(!!res.data.status); // ✅ Jika status ada, berarti sudah submit
    } catch {
      setHasSubmittedKyc(false);
    }
  };

  if (loading) return <LoadingPage />;
  if (!user || user.role === "admin") return null;

  return (
    <DashboardLayout>
      <UserInfoCard
        user={user}
        userActivationProgress={userActivationProgress}
        hasSubmittedKyc={hasSubmittedKyc}
      />

      <div
        className="d-flex flex-wrap justify-content-center gap-3 mt-4"
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
        }}
      >
        <CardItem
          title="Jumlah Downline"
          description={`${downlines.length} Downlines`}
          icon="/images/icons/downline.png"
        />
        <CardItem
          title="Saldo TBP"
          description={stats.tbpBalance !== null ? `${stats.tbpBalance} TBP` : "-"}
          icon="/images/icons/tbp.png"
        />
        <CardItem
          title="Jumlah Transaksi"
          description={stats.transactionCount ?? "-"}
          icon="/images/icons/transaction.png"
        />
        <CardItem
          title="Jumlah Withdrawal"
          description={stats.totalWithdrawals ?? "-"}
          icon="/images/icons/withdraw.png"
        />
        <CardItem
          title="Nilai Transaksi"
          description={
            stats.transactionValue
              ? `Rp ${Number(stats.transactionValue).toLocaleString("id-ID")}`
              : "-"
          }
          icon="/images/icons/transaction-value.png"
        />
        <CardItem
          title="Jumlah Balapan"
          description={stats.raceCount ?? "-"}
          icon="/images/icons/race.png"
        />
      </div>
    </DashboardLayout>
  );
}

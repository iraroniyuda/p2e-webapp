"use client";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/services/apiClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { logout } = useAuth();
  const router = useRouter();
  const [kycApproved, setKycApproved] = useState(false);
  const [exchangerLevel, setExchangerLevel] = useState("none");
  const [isCompanyExchanger, setIsCompanyExchanger] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔹 Fetch status KYC
  useEffect(() => {
    const fetchKycStatus = async () => {
      try {
        const res = await apiClient.get("/kyc/status");
        setKycApproved(res.data.status === "APPROVED");
      } catch {
        setKycApproved(false);
      }
    };
    fetchKycStatus();
  }, []);

  // 🔹 Fetch exchanger info
  useEffect(() => {
    const fetchUserExchangerInfo = async () => {
      try {
        const res = await apiClient.get("/user/basic-info");
        setExchangerLevel(res.data.exchangerLevel || "none");
        setIsCompanyExchanger(res.data.isCompanyExchanger || false);
      } catch {
        setExchangerLevel("none");
        setIsCompanyExchanger(false);
      }
    };
    fetchUserExchangerInfo();
  }, []);

  const navigateTo = (path) => {
    router.push(path);
    if (isMobile) setSidebarOpen(false);
  };

  const canAccessCircuit = exchangerLevel !== "none" || isCompanyExchanger;

  return (
    <div
      className="bg-primary text-white p-3 position-fixed top-0 start-0 vh-100 z-3 d-md-flex flex-column"
      style={{
        width: "220px",
        transform: isMobile
          ? sidebarOpen
            ? "translateX(0)"
            : "translateX(-100%)"
          : "translateX(0)",
        transition: "transform 0.3s ease-in-out",
      }}
    >
      {isMobile && (
        <div className="d-flex justify-content-end mb-2">
          <button className="btn btn-sm btn-light" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
      )}

      <div className="text-center mb-4">
        <img src="/logo.png" alt=" Logo" style={{ maxWidth: "80px" }} />
      </div>

      <ul className="nav flex-column">
        <li><button className="btn text-white text-start" onClick={() => navigateTo("/dashboard")}>Dashboard</button></li>
        <li><button className="btn text-white text-start" onClick={() => navigateTo("/dashboard/kyc")}>KYC</button></li>
        <li><button className="btn text-white text-start" onClick={() => navigateTo("/dashboard/referral")}>Referral</button></li>

        {kycApproved && (
          <>
            <li><button className="btn text-white text-start" onClick={() => navigateTo("/dashboard/transaction")}>Deposit</button></li>
            <li><button className="btn text-white text-start" onClick={() => navigateTo("/dashboard/balance")}>Balance</button></li>
            <li><button className="btn text-white text-start" onClick={() => navigateTo("/dashboard/airdrop")}>Airdrop</button></li>
            {/*<li><button className="btn text-white text-start" onClick={() => navigateTo("/dashboard/tokens")}>Staking TBP</button></li>*/}
            {/*<li><button className="btn text-white text-start" onClick={() => navigateTo("/dashboard/mining")}>Mining</button></li>*/}
            {/*<li><button className="btn text-white text-start" onClick={() => navigateTo("/dashboard/staking")}>Staking SBP</button></li>*/}
            <li><button className="btn text-white text-start" onClick={() => navigateTo("/dashboard/sell-tbp")}>Sell TBP</button></li>
            <li><button className="btn text-white text-start" onClick={() => navigateTo("/dashboard/withdraw")}>Withdraw</button></li>
            {canAccessCircuit && (
              <li><button className="btn text-white text-start" onClick={() => navigateTo("/dashboard/circuit")}>Circuit</button></li>
            )}
            <li><button className="btn text-white text-start" onClick={() => navigateTo("/dashboard/championship")}>Championship</button></li>
          </>
        )}

        <li className="mt-4">
          <button className="btn btn-danger w-100" onClick={logout}>Logout</button>
        </li>
      </ul>
    </div>
  );
}

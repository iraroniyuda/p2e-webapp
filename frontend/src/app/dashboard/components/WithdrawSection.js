"use client";
import { useAuth } from "@/contexts/AuthContext"; // pastikan ini tersedia di projectmu
import { useState } from "react";

import CreateWithdrawForm from "./withdraw/CreateWithdrawForm";
import SbpConvertHistory from "./withdraw/SbpConvertHistory";
import SbpExchangeForm from "./withdraw/SbpExchangeForm";
import WithdrawStatusSection from "./withdraw/WithdrawStatusSection";

export default function WithdrawSection() {
  const { user } = useAuth(); // ambil user info dari context
  const [activeTab, setActiveTab] = useState("create");

  // ❗️ Cek apakah user boleh melihat tab SBP Exchange
  const canAccessSbpExchange = user?.isCompanyExchanger || user?.exchangerLevel !== "none";

  const renderContent = () => {
    switch (activeTab) {
      case "create":
        return <CreateWithdrawForm />;
      case "status":
        return <WithdrawStatusSection />;
      case "exchange":
        return canAccessSbpExchange ? <SbpExchangeForm /> : <p className="text-danger">Akses tidak diperbolehkan.</p>;
      case "exchange-history":
        return canAccessSbpExchange ? <SbpConvertHistory /> : <p className="text-danger">Akses tidak diperbolehkan.</p>;
      default:
        return <CreateWithdrawForm />;
    }
  };

  const getTabStyle = (key) => ({
    backgroundColor: activeTab === key ? "#28a745" : "white",
    color: activeTab === key ? "white" : "black",
    borderColor: "#ced4da",
  });

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-light">Withdraw</h2>

      {/* ✅ Tabs */}
      <div className="flex space-x-4 mb-4">
        <button
          className="px-4 py-2 rounded border"
          style={getTabStyle("create")}
          onClick={() => setActiveTab("create")}
        >
          Buat Withdraw
        </button>

        <button
          className="px-4 py-2 rounded border"
          style={getTabStyle("status")}
          onClick={() => setActiveTab("status")}
        >
          History Withdrawal
        </button>

        {canAccessSbpExchange && (
          <>
            <button
              className="px-4 py-2 rounded border"
              style={getTabStyle("exchange")}
              onClick={() => setActiveTab("exchange")}
            >
              Claim SBP
            </button>
            <button
              className="px-4 py-2 rounded border"
              style={getTabStyle("exchange-history")}
              onClick={() => setActiveTab("exchange-history")}
            >
              Riwayat Claim
            </button>
          </>
        )}
      </div>

      <div className="mt-4">{renderContent()}</div>
    </div>
  );
}

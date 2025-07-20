"use client";
import { useState } from "react";
import SuccessSummaryTab from "./transaction/SuccessSummaryTab";
import TopUpSection from "./transaction/TopUpSection";
import TransactionHistory from "./transaction/TransactionHistory";

export default function TransactionSection() {
  const [activeTab, setActiveTab] = useState("topup");

  const renderContent = () => {
    switch (activeTab) {
      case "topup":
        return <TopUpSection />;
      case "history":
        return <TransactionHistory />;
      case "summary":
        return <SuccessSummaryTab />;
      default:
        return <TopUpSection />;
    }
  };

  const getTabStyle = (key) => ({
    backgroundColor: activeTab === key ? "#28a745" : "white",
    color: activeTab === key ? "white" : "black",
    borderColor: "#ced4da",
  });

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-light">Configuration</h2>

      {/* ✅ Navigation Tabs */}
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          className="px-4 py-2 rounded border"
          style={getTabStyle("topup")}
          onClick={() => setActiveTab("topup")}
        >
          Top-Up
        </button>

        <button
          className="px-4 py-2 rounded border"
          style={getTabStyle("history")}
          onClick={() => setActiveTab("history")}
        >
          History
        </button>

        <button
          className="px-4 py-2 rounded border"
          style={getTabStyle("summary")}
          onClick={() => setActiveTab("summary")}
        >
          Summary
        </button>
      </div>

      {/* ✅ Dynamic Content */}
      <div className="mt-4">{renderContent()}</div>
    </div>
  );
}

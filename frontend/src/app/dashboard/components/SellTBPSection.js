"use client";
import { useState } from "react";
import ConvertTbpToRupiahTab from "./transaction/ConvertTbpToRupiahTab";
import TbpToRupiahHistoryTab from "./transaction/TbpToRupiahHistoryTab";

export default function SellTBPSection() {
  const [activeTab, setActiveTab] = useState("tbp-to-rupiah");

  const renderContent = () => {
    switch (activeTab) {
      case "tbp-to-rupiah":
        return <ConvertTbpToRupiahTab />;
      case "tbp-to-rupiah-history":
      return <TbpToRupiahHistoryTab />;

      default:
        return <ConvertTbpToRupiahTab />;
    }
  };

  const getTabStyle = (key) => ({
    backgroundColor: activeTab === key ? "#28a745" : "white",
    color: activeTab === key ? "white" : "black",
    borderColor: "#ced4da",
  });

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-light">Jual TBP</h2>

      {/* ✅ Navigation Tabs */}
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          className="px-4 py-2 rounded border"
          style={getTabStyle("tbp-to-rupiah")}
          onClick={() => setActiveTab("tbp-to-rupiah")}
        >
          TBP → Rupiah
        </button>
        <button
          className="px-4 py-2 rounded border"
          style={getTabStyle("tbp-to-rupiah-history")}
          onClick={() => setActiveTab("tbp-to-rupiah-history")}
        >
          Riwayat TBP → Rupiah
        </button>

      </div>

      {/* ✅ Dynamic Content */}
      <div className="mt-4">{renderContent()}</div>
    </div>
  );
}

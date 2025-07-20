"use client";

import { useState } from "react";
import CircuitPackageTab from "./circuit/CircuitPackageTab";

export default function CircuitSection() {
  const [activeTab, setActiveTab] = useState("packages");

  const renderContent = () => {
    switch (activeTab) {
      case "packages":
        return <CircuitPackageTab />;
      default:
        return <CircuitPackageTab />;
    }
  };

    const getTabStyle = (key) => ({
      backgroundColor: activeTab === key ? "#28a745" : "white",
      color: activeTab === key ? "white" : "black",
      borderColor: "#ced4da",
    });
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-light">Paket Circuit Owner</h2>

      <div className="flex space-x-4 mb-4">
        <button className="px-4 py-2 rounded border" style={getTabStyle("packages")} onClick={() => setActiveTab("packages")}>
          Paket
        </button>
      </div>

      <div className="mt-4">{renderContent()}</div>
    </div>
  );
}

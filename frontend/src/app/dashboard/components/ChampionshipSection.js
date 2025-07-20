"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

import MyChampionshipsTab from "./championship/MyChampionshipsTab";
import MyGroupTab from "./championship/MyGroupTab";
import RequestChampionshipForm from "./championship/RequestChampionshipForm";
import UpcomingChampionshipsTab from "./championship/UpcomingChampionshipsTab";

export default function ChampionshipSection() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");

  const hasCircuitOwnerAccess = user?.circuitOwnerLevel && user.circuitOwnerLevel !== "none";
  const hasExchangerAccess = user?.isCompanyExchanger || user?.exchangerLevel !== "none";
  const canAccessMyChampionships = hasCircuitOwnerAccess && hasExchangerAccess;

  const tabs = [
    { key: "upcoming", label: "Upcoming" },
    { key: "my-group", label: "My Group" },
    ...(canAccessMyChampionships
      ? [
          { key: "my", label: "My Championships" },
          { key: "request", label: "Request" },
        ]
      : []),
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "my":
        return canAccessMyChampionships ? (
          <MyChampionshipsTab />
        ) : (
          <p className="text-danger">Akses tidak diperbolehkan.</p>
        );
      case "request":
        return canAccessMyChampionships ? (
          <RequestChampionshipForm />
        ) : (
          <p className="text-danger">Akses tidak diperbolehkan.</p>
        );
      case "my-group":
        return <MyGroupTab />;
      case "upcoming":
      default:
        return <UpcomingChampionshipsTab />;
    }
  };

  const getTabStyle = (key) => ({
    backgroundColor: activeTab === key ? "#28a745" : "white",
    color: activeTab === key ? "white" : "black",
    borderColor: "#ced4da",
  });

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-light">Championship</h2>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className="px-4 py-2 rounded border"
            style={getTabStyle(tab.key)}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">{renderContent()}</div>


    </div>
  );
}

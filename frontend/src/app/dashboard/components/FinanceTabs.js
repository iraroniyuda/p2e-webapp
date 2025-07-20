"use client";
import { useState } from "react";

export default function FinanceTabs() {
  const [activeTab, setActiveTab] = useState("Transaction");

  const tabs = ["Transaction", "History", "Deposit", "Withdraw", "Purchase", "Report"];

  return (
    <div className="container mt-5 text-white">
      <h2 className="mb-3">Riwayat Transaksi</h2>

      <ul className="nav nav-tabs mb-3">
        {tabs.map((tab) => (
          <li className="nav-item" key={tab}>
            <button
              className={`nav-link ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          </li>
        ))}
      </ul>

      <div className="card p-4 shadow-sm rounded-4">
        <h4>{activeTab}</h4>
        <hr />
        {activeTab === "Transaction" && <TransactionSection />}
        {activeTab === "History" && <HistorySection />}
        {activeTab === "Deposit" && <DepositSection />}
        {activeTab === "Withdraw" && <WithdrawSection />}
        {activeTab === "Purchase" && <PurchaseSection />}
        {activeTab === "Report" && <ReportSection />}
      </div>
    </div>
  );
}

function TransactionSection() {
  return <p>This is the Transaction section header. (No data yet)</p>;
}

function HistorySection() {
  return <p>This is the History section header. (No data yet)</p>;
}

function DepositSection() {
  return <p>This is the Deposit section header. (No data yet)</p>;
}

function WithdrawSection() {
  return <p>This is the Withdraw section header. (No data yet)</p>;
}

function PurchaseSection() {
  return <p>This is the Purchase section header. (No data yet)</p>;
}

function ReportSection() {
  return <p>This is the Report section header. (No data yet)</p>;
}

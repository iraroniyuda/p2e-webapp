"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Form, Table } from "react-bootstrap";
import AdminSidebar from "../components/AdminSidebar";

export default function FinanceManagementPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Dummy Data untuk Laporan Pendapatan
  const incomeData = [
    { source: "Fee Transaksi", amount: "500 TBP", date: "2025-05-12" },
    { source: "Pembelian Token", amount: "1000 TBP", date: "2025-05-11" },
    { source: "Event Balapan", amount: "300 TBP", date: "2025-05-10" },
  ];

  // Dummy Data untuk Laporan Pengeluaran
  const expenseData = [
    { expense: "Hosting", amount: "200 TBP", date: "2025-05-12" },
    { expense: "Pengembangan", amount: "400 TBP", date: "2025-05-11" },
    { expense: "Marketing", amount: "150 TBP", date: "2025-05-10" },
  ];

  // Dummy Data untuk Laporan Pembayaran Staking
  const stakingPayments = [
    { user: "User A", amount: "100 TBP", date: "2025-05-12" },
    { user: "User B", amount: "50 TBP", date: "2025-05-11" },
    { user: "User C", amount: "75 TBP", date: "2025-05-10" },
  ];

  // Pengaturan Royalti Sirkuit
  const [royaltySettings, setRoyaltySettings] = useState({
    circuitRentPrice: 500, // Harga sewa sirkuit per pertandingan
    revenueShare: 20, // Persentase bagi hasil untuk penyelenggara
  });

  const handleSettingChange = (field, value) => {
    setRoyaltySettings((prev) => ({ ...prev, [field]: value }));
  };

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
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
      <AdminSidebar />
      <div className="flex-grow-1 p-4 text-white">
        <h1>Manajemen Keuangan</h1>

        {/* Section 1: Laporan Pendapatan */}
        <div className="mb-4">
          <h2>Laporan Pendapatan</h2>
          <Table variant="light" striped bordered hover>
            <thead>
              <tr>
                <th>Sumber</th>
                <th>Jumlah</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {incomeData.map((inc, index) => (
                <tr key={index}>
                  <td>{inc.source}</td>
                  <td>{inc.amount}</td>
                  <td>{inc.date}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Section 2: Laporan Pengeluaran */}
        <div className="mb-4">
          <h2>Laporan Pengeluaran</h2>
          <Table variant="light" striped bordered hover>
            <thead>
              <tr>
                <th>Pengeluaran</th>
                <th>Jumlah</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {expenseData.map((exp, index) => (
                <tr key={index}>
                  <td>{exp.expense}</td>
                  <td>{exp.amount}</td>
                  <td>{exp.date}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Section 3: Laporan Pembayaran Staking */}
        <div className="mb-4">
          <h2>Laporan Pembayaran Staking</h2>
          <Table variant="light" striped bordered hover>
            <thead>
              <tr>
                <th>Pengguna</th>
                <th>Jumlah</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {stakingPayments.map((payment, index) => (
                <tr key={index}>
                  <td>{payment.user}</td>
                  <td>{payment.amount}</td>
                  <td>{payment.date}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Section 4: Pengaturan Royalti Sirkuit */}
        <div className="mb-4">
          <h2>Pengaturan Royalti Sirkuit</h2>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Harga Sewa Sirkuit (TBP)</Form.Label>
              <Form.Control
                type="number"
                value={royaltySettings.circuitRentPrice}
                onChange={(e) => handleSettingChange("circuitRentPrice", e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Bagi Hasil untuk Penyelenggara (%)</Form.Label>
              <Form.Control
                type="number"
                value={royaltySettings.revenueShare}
                onChange={(e) => handleSettingChange("revenueShare", e.target.value)}
              />
            </Form.Group>
            <Button variant="primary">Simpan Pengaturan</Button>
          </Form>
        </div>
      </div>
    </div>
  );
}

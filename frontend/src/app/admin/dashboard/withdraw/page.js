"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Form, Table } from "react-bootstrap";
import AdminSidebar from "../components/AdminSidebar";

export default function WithdrawAndExchangePage() {
  const { user } = useAuth();
  const router = useRouter();

  // Dummy Data untuk Permintaan Withdraw
  const [withdrawRequests, setWithdrawRequests] = useState([
    { id: 1, username: "User A", amount: "500 TBP", status: "Pending", date: "2025-05-12" },
    { id: 2, username: "User B", amount: "300 TBP", status: "Pending", date: "2025-05-12" },
    { id: 3, username: "User C", amount: "100 TBP", status: "Approved", date: "2025-05-11" },
  ]);

  // State untuk Rate Exchange
  const [exchangeRate, setExchangeRate] = useState({
    tbpToFiat: 0.05, // 1 TBP = 0.05 USD (contoh)
  });

  // Fungsi untuk Menyetujui Withdraw
  const handleApproveWithdraw = (id) => {
    setWithdrawRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: "Approved" } : req
      )
    );
    alert("Withdraw berhasil disetujui.");
  };

  // Fungsi untuk Menolak Withdraw
  const handleRejectWithdraw = (id) => {
    setWithdrawRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: "Rejected" } : req
      )
    );
    alert("Withdraw berhasil ditolak.");
  };

  // Fungsi untuk Mengubah Rate Exchange
  const handleExchangeRateChange = (value) => {
    setExchangeRate({ tbpToFiat: value });
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
        <h1>Withdraw & Exchange</h1>

        {/* Section 1: Verifikasi Withdraw */}
        <div className="mb-4">
          <h2>Verifikasi Withdraw</h2>
          <Table variant="light" striped bordered hover>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Pengguna</th>
                <th>Jumlah</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {withdrawRequests.map((req) => (
                <tr key={req.id}>
                  <td>{req.date}</td>
                  <td>{req.username}</td>
                  <td>{req.amount}</td>
                  <td>{req.status}</td>
                  <td>
                    {req.status === "Pending" ? (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          className="me-2"
                          onClick={() => handleApproveWithdraw(req.id)}
                        >
                          Setujui
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRejectWithdraw(req.id)}
                        >
                          Tolak
                        </Button>
                      </>
                    ) : (
                      <span>{req.status}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Section 2: Pengaturan Rate Exchange */}
        <div className="mb-4">
          <h2>Pengaturan Rate Exchange</h2>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Rate Exchange TBP ke Fiat (USD)</Form.Label>
              <Form.Control
                type="number"
                value={exchangeRate.tbpToFiat}
                onChange={(e) => handleExchangeRateChange(e.target.value)}
                step="0.01"
              />
            </Form.Group>
            <Button variant="primary">Simpan Rate</Button>
          </Form>
        </div>

        {/* Section 3: Monitoring Withdraw */}
        <div className="mb-4">
          <h2>Monitoring Withdraw</h2>
          <Table variant="light" striped bordered hover>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Pengguna</th>
                <th>Jumlah</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {withdrawRequests.map((req) => (
                <tr key={req.id}>
                  <td>{req.date}</td>
                  <td>{req.username}</td>
                  <td>{req.amount}</td>
                  <td>{req.status}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
}

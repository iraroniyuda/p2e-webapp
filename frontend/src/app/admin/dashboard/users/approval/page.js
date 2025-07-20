"use client";
import apiClient from "@/services/apiClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, Button, Collapse, Spinner, Table } from "react-bootstrap";
import AdminSidebar from "../../components/AdminSidebar";

export default function UserApproval() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [marginLeft, setMarginLeft] = useState("0px");

  const handleBack = () => router.push("/admin/dashboard/users");

  const buildImageUrl = (path) => {
    if (!path) return null;
    return path.replace("/api/public/kyc", "");
  };

  const fetchKycRequests = async () => {
    try {
      const res = await apiClient.get("/admin/kyc");
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Admin KYC fetch error:", err);
      setError("Gagal mengambil data KYC.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await apiClient.post(`/admin/kyc/${id}/approve`);
      fetchKycRequests();
    } catch {
      alert("❌ Gagal menyetujui KYC.");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Masukkan alasan penolakan:");
    if (reason) {
      try {
        await apiClient.post(`/admin/kyc/${id}/reject`, { reason });
        fetchKycRequests();
      } catch {
        alert("❌ Gagal menolak KYC.");
      }
    }
  };

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  useEffect(() => {
    fetchKycRequests();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setMarginLeft(window.innerWidth >= 768 ? "220px" : "0px");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div
        className="flex-grow-1 p-4 text-white"
        style={{ marginLeft, transition: "margin-left 0.3s ease" }}
      >
        <button
          className="btn btn-primary d-md-none mb-3"
          onClick={() => setSidebarOpen(true)}
        >
          ☰ Menu
        </button>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Approval Pengguna</h2>
          <Button variant="secondary" onClick={handleBack}>
            Kembali
          </Button>
        </div>

        {loading ? (
          <div className="text-white py-5">
            <Spinner animation="border" variant="light" />
            <div>Memuat data KYC...</div>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : requests.length === 0 ? (
          <div className="alert alert-info bg-dark text-white">Belum ada permintaan KYC.</div>
        ) : (
          <div className="table-responsive">
            <Table bordered hover variant="dark">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Status</th>
                  <th>Aksi</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {[...requests]
                  .sort((a, b) => {
                    if (a.status === "PENDING" && b.status !== "PENDING") return -1;
                    if (a.status !== "PENDING" && b.status === "PENDING") return 1;
                    return 0;
                  })
                  .map((r) => (
                    <>
                      <tr key={r.id}>
                        <td>
                          <strong>{r.user?.username || `User #${r.userId}`}</strong>
                          <br />
                          <span className="text-muted small">{r.user?.email}</span>
                        </td>
                        <td>
                          {r.status === "PENDING" && <span className="badge bg-warning text-dark">Pending</span>}
                          {r.status === "APPROVED" && <span className="badge bg-success">Approved</span>}
                          {r.status === "REJECTED" && <span className="badge bg-danger">Rejected</span>}
                        </td>
                        <td>
                          {r.status === "PENDING" ? (
                            <>
                              <Button variant="success" size="sm" className="me-2" onClick={() => handleApprove(r.id)}>Approve</Button>
                              <Button variant="danger" size="sm" onClick={() => handleReject(r.id)}>Reject</Button>
                            </>
                          ) : r.status === "REJECTED" ? (
                            <span className="text-danger small">Rejected: {r.reasonRejected}</span>
                          ) : (
                            <span className="text-success small">Approved</span>
                          )}
                        </td>
                        <td>
                          <Button
                            variant="outline-light"
                            size="sm"
                            onClick={() => toggleRow(r.id)}
                          >
                            {expandedRow === r.id ? "Sembunyikan" : "Lihat Detail"}
                          </Button>
                        </td>
                      </tr>

                      <tr>
                        <td colSpan={4} className="p-0">
                          <Collapse in={expandedRow === r.id}>
                            <div className="p-3 bg-secondary text-white">
                              <div><strong>Nama:</strong> {r.fullName}</div>
                              <div><strong>NIK:</strong> {r.nikNumber}</div>
                              <div><strong>Tanggal Lahir:</strong> {r.dateOfBirth}</div>
                              <div><strong>No HP:</strong> {r.phoneNumber}</div>
                              <div><strong>Wallet:</strong> {r.walletAddress || "-"}</div>
                              <div><strong>No Rekening:</strong> {r.bankAccountNumber || "-"}</div>
                              <div className="mt-2">
                                <strong>ID Card:</strong>{" "}
                                {buildImageUrl(r.idCardImageUrl) ? (
                                  <a href={buildImageUrl(r.idCardImageUrl)} target="_blank" rel="noopener noreferrer" className="text-white">View</a>
                                ) : (
                                  <span className="text-muted">No File</span>
                                )}
                              </div>
                              <div>
                                <strong>Selfie:</strong>{" "}
                                {buildImageUrl(r.selfieImageUrl) ? (
                                  <a href={buildImageUrl(r.selfieImageUrl)} target="_blank" rel="noopener noreferrer" className="text-white">View</a>
                                ) : (
                                  <span className="text-muted">No File</span>
                                )}
                              </div>
                            </div>
                          </Collapse>
                        </td>
                      </tr>
                    </>
                  ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import apiClient from "@/services/apiClient";
import { useEffect, useState } from "react";

export default function AdminKycPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchKycRequests();
  }, []);

  const fetchKycRequests = async () => {
    try {
      const res = await apiClient.get("/admin/kyc");
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Admin KYC fetch error:", err);
      setError("Failed to fetch KYC requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await apiClient.post(`/admin/kyc/${id}/approve`);
      fetchKycRequests();
    } catch (err) {
      alert("❌ Failed to approve KYC.");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      await apiClient.post(`/admin/kyc/${id}/reject`, { reason });
      fetchKycRequests();
    } catch (err) {
      alert("❌ Failed to reject KYC.");
    }
  };

  const buildImageUrl = (path) =>
    path?.replace("/api/public/kyc", "");

  const renderStatusBadge = (status) => {
    const badgeMap = {
      PENDING: <span className="badge bg-warning text-dark">Pending</span>,
      APPROVED: <span className="badge bg-success">Approved</span>,
      REJECTED: <span className="badge bg-danger">Rejected</span>,
    };
    return badgeMap[status] || <span className="badge bg-secondary">Unknown</span>;
  };

  const renderActionButtons = (request) => {
    if (request.status === "PENDING") {
      return (
        <>
          <button className="btn btn-sm btn-success me-2" onClick={() => handleApprove(request.id)}>
            Approve
          </button>
          <button className="btn btn-sm btn-danger" onClick={() => handleReject(request.id)}>
            Reject
          </button>
        </>
      );
    }
    if (request.status === "REJECTED") {
      return <span className="text-danger small">Rejected: {request.reasonRejected}</span>;
    }
    return <span className="text-success small">Approved</span>;
  };

  if (loading) return <div className="text-center py-5">🔄 Loading KYC requests...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container py-4">
      <h2 className="mb-4">KYC Requests</h2>
      {requests.length === 0 ? (
        <p>No KYC requests yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped align-middle">
            <thead className="table-light">
              <tr>
                <th>User</th>
                <th>Nama</th>
                <th>NIK</th>
                <th>Tgl Lahir</th>
                <th>No HP</th>
                <th>Wallet</th>
                <th>No Rek</th>
                <th>Status</th>
                <th>ID Card</th>
                <th>Selfie</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div>{r.user?.username || `User #${r.userId}`}</div>
                    <div className="text-muted small">{r.user?.email}</div>
                  </td>
                  <td>{r.fullName}</td>
                  <td>{r.nikNumber}</td>
                  <td>{r.dateOfBirth}</td>
                  <td>{r.phoneNumber}</td>
                  <td>
                    <code className="small">{r.walletAddress || "-"}</code>
                  </td>
                  <td>
                    <code className="small">{r.bankAccountNumber || "-"}</code>
                  </td>
                  <td>{renderStatusBadge(r.status)}</td>
                  <td>
                    {buildImageUrl(r.idCardImageUrl) ? (
                      <a href={buildImageUrl(r.idCardImageUrl)} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    ) : (
                      <span className="text-muted">No File</span>
                    )}
                  </td>
                  <td>
                    {buildImageUrl(r.selfieImageUrl) ? (
                      <a href={buildImageUrl(r.selfieImageUrl)} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    ) : (
                      <span className="text-muted">No File</span>
                    )}
                  </td>
                  <td>{renderActionButtons(r)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

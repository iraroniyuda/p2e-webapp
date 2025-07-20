"use client";

import { fetchAllUsers, toggleUserSuspend } from "@/services/apiClient";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import React, { useEffect, useState } from "react";
import { Button, Collapse, Form, Spinner, Table } from "react-bootstrap";
import AdminSidebar from "../../components/AdminSidebar";


export default function UserListPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [marginLeft, setMarginLeft] = useState("0px");

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadUsers(search);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  useEffect(() => {
    const handleResize = () => {
      setMarginLeft(window.innerWidth >= 768 ? "220px" : "0px");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadUsers = async (query = "") => {
    try {
      setLoading(true);
      const res = await fetchAllUsers(query);
      setUsers(res);
    } catch (err) {
      console.error("❌ Gagal mengambil data user:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSuspend = async (userId) => {
    await toggleUserSuspend(userId);
    await loadUsers(search);
  };

  const handleDownloadCSV = () => {
    // Buat data array untuk CSV
    const data = users.map((user, i) => ({
      "No.": i + 1,
      "Username": user.username,
      "Email": user.email,
      "Level": user.userLevel,
      "Referral Oleh": user.referrer ? user.referrer.username : "-",
      "Tanggal Daftar": parseDate(user.createdAt)
        ? parseDate(user.createdAt).toLocaleString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-",
      "Status": user.isSuspended ? "Suspended" : "Aktif",
      "Wallet": user.wallet || "-",
      "Exchanger Level": user.exchangerLevel || "-",
      "Balance SBP": user.balance?.sbp ?? 0,
      "Balance Race": user.balance?.race ?? 0,
      "Balance Claimed TBP": user.balance?.claimedTbp ?? 0,
      "Balance Rupiah": user.balance?.rupiah ?? 0,
    }));

    const csv = Papa.unparse(data);

    // Buat download file
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "daftar_pengguna.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const parseDate = (raw) => {
    if (!raw) return null;
    const iso = raw.includes("T") ? raw : raw.replace(" ", "T");
    const date = new Date(iso);
    return isNaN(date) ? null : date;
  };


  const toggleDetail = (userId) => {
    setExpanded((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  return (
    <div
      className="d-flex position-relative"
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

        <Button variant="success" className="mb-3 me-2" onClick={handleDownloadCSV}>
          ⬇️ Download CSV
        </Button>

        <h2>Daftar Pengguna</h2>

        <Form.Control
          type="text"
          placeholder="Cari username atau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3"
          style={{ maxWidth: "400px" }}
        />

        <div className="mb-3">
          <Button variant="secondary" onClick={() => router.push("/admin/dashboard/users")}>
            Kembali
          </Button>
        </div>

        {loading ? (
          <Spinner animation="border" />
        ) : (
          <div className="table-responsive">
            <Table striped bordered hover variant="dark">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Level</th>
                  <th>Referral Oleh</th>
                  <th>Tanggal Daftar</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {users.length > 0 ? (
                  users.map((user, i) => (
                    <React.Fragment key={user.id}>
                      <tr>
                        <td>{i + 1}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>{user.userLevel}</td>
                        <td>{user.referrer ? user.referrer.username : "-"}</td>
                        <td>
                          {parseDate(user.createdAt)
                            ? parseDate(user.createdAt).toLocaleString("id-ID", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </td>
                        <td>{user.isSuspended ? "Suspended" : "Aktif"}</td>
                        <td>
                          <Button
                            size="sm"
                            variant="info"
                            className="me-2"
                            onClick={() => toggleDetail(user.id)}
                          >
                            Detail
                          </Button>
                          <Button
                            size="sm"
                            variant={user.isSuspended ? "success" : "warning"}
                            onClick={() => handleToggleSuspend(user.id)}
                          >
                            {user.isSuspended ? "Unsuspend" : "Suspend"}
                          </Button>
                        </td>
                      </tr>
                      <tr key={user.id + "-detail"}>
                        <td colSpan="8" style={{ padding: 0, background: "#222" }}>
                          <Collapse in={expanded[user.id]}>
                            <div className="p-3">
                              <strong>Wallet:</strong> {user.wallet || "-"} <br />
                              <strong>User Level:</strong> {user.userLevel || "-"} <br />
                              <strong>Exchanger Level:</strong> {user.exchangerLevel || "-"} <br />
                              <strong>Balance:</strong><br />
                              - SBP: {user.balance?.sbp ?? 0}<br />
                              - RACE: {user.balance?.race ?? 0}<br />
                              - TBP: {user.balance?.tbp ?? 0}<br />
                              - Claimed TBP: {user.balance?.claimedTbp ?? 0}<br />
                              - Rupiah: {user.balance?.rupiah ?? 0}
                            </div>
                          </Collapse>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      Tidak ada pengguna ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>

            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

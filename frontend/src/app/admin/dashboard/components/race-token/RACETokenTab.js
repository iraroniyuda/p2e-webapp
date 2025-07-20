"use client";

import apiClient from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row, Spinner, Table } from "react-bootstrap";

export default function RACETokenTab() {
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    data: [],
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0,
  });
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    fetchData();
  }, [pagination.page]); // Fetch ulang saat page berubah

  const fetchData = async () => {
    setLoading(true);
    try {
      const [balanceRes, usersRes] = await Promise.all([
        apiClient.get(`/admin/race/users?page=${pagination.page}&limit=${pagination.limit}`),
        apiClient.get("/admin/sbp/all-users"),
      ]);
      setPagination((prev) => ({
        ...prev,
        ...balanceRes.data,
      }));
      setUsers(usersRes.data);
    } catch (err) {
      alert("Gagal memuat data RACE");
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedUserId || !amount) return alert("Isi user dan jumlah");

    try {
      await apiClient.post("/admin/race/transfer", {
        userId: selectedUserId,
        amount: Number(amount),
      });
      alert("✅ Transfer berhasil");
      setAmount("");
      fetchData();
    } catch {
      alert("Gagal transfer");
    }
  };

  const goToNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const goToPrevPage = () => {
    if (pagination.page > 1) {
      setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  };

  return (
    <div className="text-white">
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <>
          <Row>
            <Col md={6}>
              <Card className="bg-dark text-white mb-4 p-3">
                <h4>Transfer Manual RACE</h4>
                <Form.Group className="mb-3">
                  <Form.Label>User</Form.Label>
                  <Form.Select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    <option value="">-- pilih user --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username} ({u.email})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Jumlah RACE</Form.Label>
                  <Form.Control
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </Form.Group>

                <Button onClick={handleTransfer}>Transfer</Button>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="bg-dark text-white mb-4 p-3">
                <h4>Saldo RACE Pengguna</h4>
                <Table striped bordered hover variant="dark">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagination.data.map((u, i) => (
                      <tr key={u.userId}>
                        <td>{(pagination.page - 1) * pagination.limit + i + 1}</td>
                        <td>{u.username || "-"}</td>
                        <td>{u.email || "-"}</td>
                        <td>{u.balance}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <div className="d-flex justify-content-between align-items-center mt-3">
                  <Button variant="secondary" onClick={goToPrevPage} disabled={pagination.page === 1}>
                    ⬅ Prev
                  </Button>
                  <span>
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button variant="secondary" onClick={goToNextPage} disabled={pagination.page === pagination.totalPages}>
                    Next ➡
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}

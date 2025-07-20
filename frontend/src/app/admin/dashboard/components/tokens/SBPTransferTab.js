"use client";

import {
  getAllUsers,
  listSbpUsers,
  transferSbpToUser,
} from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row, Spinner, Table } from "react-bootstrap";

// 🔧 Helper functions
const formatNumberWithSeparator = (value) => {
  if (!value && value !== 0) return "";
  return new Intl.NumberFormat("id-ID").format(value);
};

const parseNumberFromFormatted = (formatted) => {
  return Number(String(formatted).replace(/\./g, "").replace(/,/g, ""));
};

export default function SBPTransferTab() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    data: [],
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0,
  });
  const [selectedUserId, setSelectedUserId] = useState("");
  const [assignAmount, setAssignAmount] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [pagination.page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [userList, balanceList] = await Promise.all([
        getAllUsers(),
        listSbpUsers(pagination.page, pagination.limit), // ⬅️ kirim page & limit
      ]);
      setUsers(userList);
      setPagination((prev) => ({ ...prev, ...balanceList }));
    } catch (err) {
      alert("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUserId || !assignAmount) {
      alert("Pilih user dan isi jumlah");
      return;
    }

    try {
      await transferSbpToUser(selectedUserId, parseNumberFromFormatted(assignAmount));
      alert("✅ S-BP berhasil ditransfer");
      setAssignAmount("");
      loadData();
    } catch (err) {
      alert("❌ Gagal transfer S-BP");
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

  if (loading) {
    return (
      <div className="text-white">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="text-white">
      <Row>
        <Col md={6}>
          <Card className="bg-dark text-white mb-4">
            <Card.Body>
              <h3>Transfer Manual ke User</h3>

              <Form.Group className="mb-3">
                <Form.Label>Pilih User</Form.Label>
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
                <Form.Label>Jumlah S-BP</Form.Label>
                <Form.Control
                  type="text"
                  value={formatNumberWithSeparator(assignAmount)}
                  onChange={(e) =>
                    setAssignAmount(parseNumberFromFormatted(e.target.value))
                  }
                />
              </Form.Group>

              <Button variant="primary" onClick={handleAssign}>
                Transfer ke User
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="bg-dark text-white">
            <Card.Body>
              <h4>Daftar Balance User</h4>
              <Table striped bordered hover variant="dark" responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>S-BP</th>
                  </tr>
                </thead>
                <tbody>
                  {pagination.data.map((u, i) => (
                    <tr key={u.userId}>
                      <td>{(pagination.page - 1) * pagination.limit + i + 1}</td>
                      <td>{u.username || "-"}</td>
                      <td>{u.email || "-"}</td>
                      <td>{formatNumberWithSeparator(u.balance)}</td>
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
                <Button
                  variant="secondary"
                  onClick={goToNextPage}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next ➡
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

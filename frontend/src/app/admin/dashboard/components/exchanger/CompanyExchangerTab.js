"use client";

import {
  assignCompanyExchanger,
  getAllExchangerUsers,
  getCompanyExchangers,
} from "@/services/apiClient";

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Col,
  Form,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";

export default function CompanyExchangerTab() {
  const [allUsers, setAllUsers] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [userList, assignedList] = await Promise.all([
        getAllExchangerUsers(),
        getCompanyExchangers(),
      ]);
      setAllUsers(userList || []);
      setAssignedUsers(assignedList || []);
    } catch (err) {
      console.error("❌ Gagal mengambil data:", err);
      setError("Gagal memuat data exchanger.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUserId) return;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await assignCompanyExchanger(selectedUserId);
      const updatedCompanies = await getCompanyExchangers();
      setAssignedUsers(updatedCompanies || []);
      setSelectedUserId("");
      setSuccess("User berhasil ditetapkan sebagai company exchanger.");
    } catch (err) {
      console.error("❌ Gagal assign:", err);
      setError("Gagal menetapkan user sebagai company exchanger.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h4 className="mb-3">Penunjukan Company Exchanger</h4>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row className="align-items-center mb-4">
        <Col md={6}>
          <Form.Select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            disabled={saving}
          >
            <option value="">-- Pilih Pengguna --</option>
            {allUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username} ({user.email})
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md="auto">
          <Button onClick={handleAssign} disabled={saving || !selectedUserId}>
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </Col>
      </Row>

      <h5>Daftar Company Exchanger</h5>
      {loading ? (
        <Spinner animation="border" />
      ) : assignedUsers.length === 0 ? (
        <p className="text-muted">Belum ada company exchanger yang ditetapkan.</p>
      ) : (
        <Table striped bordered hover responsive variant="dark">
          <thead>
            <tr>
              <th>#</th>
              <th>Username</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {assignedUsers.map((user, index) => (
              <tr key={user.id}>
                <td>{index + 1}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

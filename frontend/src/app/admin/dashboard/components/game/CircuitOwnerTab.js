"use client";

import {
    assignCircuitOwner,
    getCircuitOwners,
    getUsersForCircuitOwnership,
    unassignCircuitOwner,
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

export default function CircuitOwnerTab() {
  const [allUsers, setAllUsers] = useState([]);
  const [assignedOwners, setAssignedOwners] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("company");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const ownerLevels = ["company", "silver", "gold", "platinum", "diamond"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [userList, ownerList] = await Promise.all([
        getUsersForCircuitOwnership(),
        getCircuitOwners(),
      ]);
      setAllUsers(userList || []);
      setAssignedOwners(ownerList || []);
    } catch (err) {
      console.error("❌ Gagal mengambil data:", err);
      setError("Gagal memuat data circuit owner.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUserId || !selectedLevel) return;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await assignCircuitOwner(selectedUserId, selectedLevel);
      const updatedOwners = await getCircuitOwners();
      setAssignedOwners(updatedOwners || []);
      setSelectedUserId("");
      setSuccess(`User berhasil ditetapkan sebagai Circuit Owner level ${selectedLevel}.`);
    } catch (err) {
      console.error("❌ Gagal assign:", err);
      setError("Gagal menetapkan user sebagai circuit owner.");
    } finally {
      setSaving(false);
    }
  };

  const handleUnassign = async (userId) => {
    if (!confirm("Yakin ingin mencabut status Circuit Owner dari user ini?")) return;
    try {
      await unassignCircuitOwner(userId);
      const updatedOwners = await getCircuitOwners();
      setAssignedOwners(updatedOwners || []);
    } catch (err) {
      console.error("❌ Gagal unassign:", err);
      setError("Gagal mencabut status circuit owner.");
    }
  };

  return (
    <div>
      <h4 className="mb-3">Penunjukan Circuit Owner</h4>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row className="align-items-center mb-4">
        <Col md={5}>
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
        <Col md={4}>
          <Form.Select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            disabled={saving}
          >
            {ownerLevels.map((level) => (
              <option key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
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

      <h5>Daftar Circuit Owner</h5>
      {loading ? (
        <Spinner animation="border" />
      ) : assignedOwners.length === 0 ? (
        <p className="text-muted">Belum ada circuit owner yang ditetapkan.</p>
      ) : (
        <Table striped bordered hover responsive variant="dark">
          <thead>
            <tr>
              <th>#</th>
              <th>Username</th>
              <th>Email</th>
              <th>Level</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {assignedOwners.map((user, index) => (
              <tr key={user.id}>
                <td>{index + 1}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.circuitOwnerLevel}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleUnassign(user.id)}
                  >
                    Cabut
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

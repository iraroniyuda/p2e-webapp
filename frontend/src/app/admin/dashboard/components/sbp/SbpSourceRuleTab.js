"use client";

import {
  getSbpSourceRules,
  createSbpSourceRule,
  updateSbpSourceRule,
  deleteSbpSourceRule,
} from "@/services/apiClient";
import { useEffect, useState } from "react";
import {
  Button,
  Form,
  Modal,
  Spinner,
  Table,
} from "react-bootstrap";

export default function SbpSourceRuleTab() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRule, setCurrentRule] = useState(null);

  const [formData, setFormData] = useState({
    source: "",
    locked: false,
    durationDays: 0,
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const data = await getSbpSourceRules();
      setRules(data);
    } catch (err) {
      console.error("❌ Gagal ambil rules:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowAdd = () => {
    setEditMode(false);
    setFormData({ source: "", locked: false, durationDays: 0 });
    setShowModal(true);
  };

  const handleShowEdit = (rule) => {
    setEditMode(true);
    setCurrentRule(rule);
    setFormData({
      source: rule.source,
      locked: rule.locked,
      durationDays: rule.durationDays,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Yakin ingin menghapus aturan ini?")) {
      try {
        await deleteSbpSourceRule(id);
        await fetchRules();
      } catch (err) {
        console.error("❌ Gagal hapus rule:", err);
        alert("Gagal hapus rule.");
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await updateSbpSourceRule(currentRule.id, formData);
      } else {
        await createSbpSourceRule(formData);
      }
      setShowModal(false);
      await fetchRules();
    } catch (err) {
      console.error("❌ Gagal simpan:", err);
      alert("Gagal menyimpan aturan.");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="light" />
      </div>
    );
  }

  return (
    <>
      <Button variant="success" className="mb-3" onClick={handleShowAdd}>
        + Tambah Aturan SBP
      </Button>

      <Table striped bordered hover responsive variant="dark">
        <thead>
          <tr>
            <th>#</th>
            <th>Source</th>
            <th>Locked</th>
            <th>Durasi (hari)</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule, index) => (
            <tr key={rule.id}>
              <td>{index + 1}</td>
              <td>{rule.source}</td>
              <td>{rule.locked ? "✅" : "❌"}</td>
              <td>{rule.durationDays}</td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  className="me-2"
                  onClick={() => handleShowEdit(rule)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(rule.id)}
                >
                  Hapus
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Edit Aturan" : "Tambah Aturan"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {!editMode && (
              <Form.Group className="mb-3">
                <Form.Label>Source</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.source}
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value })
                  }
                  placeholder="Contoh: airdrop, staking, topup"
                />
              </Form.Group>
            )}
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Kunci saldo ini (locked)"
                checked={formData.locked}
                onChange={(e) =>
                  setFormData({ ...formData, locked: e.target.checked })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Durasi Lock (hari)</Form.Label>
              <Form.Control
                type="number"
                value={formData.durationDays}
                onChange={(e) =>
                  setFormData({ ...formData, durationDays: parseInt(e.target.value) })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Simpan
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

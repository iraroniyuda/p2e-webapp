"use client";

import apiClient, { getSbpSourceRules } from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Form, Modal, Spinner } from "react-bootstrap";

export default function AirdropCreateModal({
  show,
  onClose,
  onCreated,
  defaultData = {},
  mode = "create", // "create" | "edit"
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    amountPerUser: 0,
    totalQuota: 0,
    deadline: "",
    source: "",
  });
  const [loading, setLoading] = useState(false);
  const [sourceOptions, setSourceOptions] = useState([]);

  useEffect(() => {
    // Fetch sumber SBP
    getSbpSourceRules().then(setSourceOptions);

    if (mode === "edit" && defaultData) {
      setForm({
        title: defaultData.title || "",
        description: defaultData.description || "",
        amountPerUser: defaultData.amountPerUser || 0,
        totalQuota: defaultData.totalQuota || 0,
        deadline: defaultData.deadline
          ? new Date(defaultData.deadline).toISOString().slice(0, 16)
          : "",
        source: defaultData.source || "",
      });
    }
  }, [defaultData, mode]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.title || !form.deadline || !form.source) {
      alert("❗️Judul, Deadline, dan Sumber SBP wajib diisi.");
      return;
    }

    const payload = {
      ...form,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
    };

    try {
      setLoading(true);

      if (mode === "edit") {
        await apiClient.post(`/admin/airdrop/schedule/${defaultData.id}/edit`, payload);
      } else {
        await apiClient.post("/admin/airdrop/create", payload);
      }

      onCreated?.();
      onClose?.();
    } catch (err) {
      console.error("❌ Gagal submit jadwal airdrop:", err);
      alert("❌ Gagal menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {mode === "edit" ? "✏️ Edit Jadwal Airdrop" : "➕ Buat Jadwal Airdrop"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Judul</Form.Label>
            <Form.Control
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Contoh: Airdrop Juli"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Deskripsi</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Deskripsi tambahan..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Jumlah SBP per User</Form.Label>
            <Form.Control
              type="number"
              name="amountPerUser"
              value={form.amountPerUser}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Total Kuota</Form.Label>
            <Form.Control
              type="number"
              name="totalQuota"
              value={form.totalQuota}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Deadline</Form.Label>
            <Form.Control
              type="datetime-local"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Sumber SBP</Form.Label>
            <Form.Select name="source" value={form.source} onChange={handleChange}>
              <option value="">-- Pilih Sumber --</option>
              {sourceOptions.map((item) => (
                <option key={item.source} value={item.source}>
                  {item.source} ({item.locked ? `Locked ${item.durationDays}d` : "Unlocked"})
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Batal
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? <Spinner size="sm" animation="border" /> : "Simpan"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

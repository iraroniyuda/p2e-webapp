"use client";

import { requestChampionship } from "@/services/apiClient";
import { useState } from "react";
import { Alert, Button, Form, Spinner } from "react-bootstrap";

export default function RequestChampionshipForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      await requestChampionship({ title, description, scheduledAt });
      setSuccessMsg("✅ Championship request berhasil dikirim.");
      setTitle("");
      setDescription("");
      setScheduledAt("");
    } catch (err) {
      console.error("❌ Gagal mengajukan championship", err);
      setErrorMsg("Terjadi kesalahan saat mengirim permintaan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h3 className="text-2xl font-bold mb-4 text-light">Request New Championship</h3>

      {successMsg && <Alert variant="success">{successMsg}</Alert>}
      {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3 text-light">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="e.g. Showdown 2025"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3 text-light">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Short description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3 text-light">
          <Form.Label>Scheduled At</Form.Label>
          <Form.Control
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
          />
        </Form.Group>

        <Button type="submit" disabled={loading}>
          {loading ? <Spinner size="sm" animation="border" /> : "Submit Request"}
        </Button>
      </Form>
    </div>
  );
}

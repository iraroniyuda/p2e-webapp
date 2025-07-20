"use client";

import {
  getSbpToTbpConversionRate,
  setSbpToTbpConversionRate,
} from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Alert, Button, Card, Form, Spinner } from "react-bootstrap";

export default function SbpToTbpConversionTab() {
  const [sbpAmount, setSbpAmount] = useState("");
  const [tbpAmount, setTbpAmount] = useState("");
  const [currentRate, setCurrentRate] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchRate = async () => {
    setLoading(true);
    try {
      const data = await getSbpToTbpConversionRate();
      setCurrentRate(data);
    } catch (err) {
      console.error("❌ Gagal ambil rasio:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRate();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sbp = parseInt(sbpAmount);
    const tbp = parseInt(tbpAmount);
    if (!sbp || !tbp || sbp <= 0 || tbp <= 0) {
      setMessage("❌ Nilai harus lebih dari 0.");
      return;
    }

    setSubmitting(true);
    try {
      await setSbpToTbpConversionRate(sbp, tbp);
      setMessage("✅ Rasio konversi berhasil diperbarui.");
      setSbpAmount("");
      setTbpAmount("");
      fetchRate();
    } catch (err) {
      console.error("❌ Gagal update rasio:", err);
      setMessage("❌ Gagal menyimpan rasio baru.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card bg="dark" text="white" className="shadow rounded">
      <Card.Body>
        <Card.Title>Rasio Konversi SBP ke TBP</Card.Title>

        {loading ? (
          <Spinner animation="border" variant="light" />
        ) : currentRate ? (
          <p className="mb-3">
            🔁 Saat ini: <strong>{currentRate.sbpAmount}</strong> SBP ={" "}
            <strong>{currentRate.tbpAmount}</strong> TBP <br />
            💹 Rasio: <strong>
              {((currentRate.tbpAmount / currentRate.sbpAmount) * 100).toFixed(2)}%
            </strong>
          </p>
        ) : (
          <p className="text-warning">Belum ada rasio yang diatur.</p>
        )}


        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Jumlah SBP</Form.Label>
            <Form.Control
              type="number"
              value={sbpAmount}
              onChange={(e) => setSbpAmount(e.target.value)}

            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Jumlah TBP (hasil)</Form.Label>
            <Form.Control
              type="number"
              value={tbpAmount}
              onChange={(e) => setTbpAmount(e.target.value)}

            />
          </Form.Group>

          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? "Menyimpan..." : "Simpan Rasio"}
          </Button>
        </Form>

        {message && (
          <Alert
            variant={message.startsWith("✅") ? "success" : "danger"}
            className="mt-3 py-2 px-3"
          >
            {message}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
}

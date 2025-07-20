"use client";

import {
  getExchangerConfig,
  updateExchangerConfig,
} from "@/services/apiClient";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";

const LEVELS = ["mid", "senior", "executive"];

export default function ExchangerConfigTab() {
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingLevel, setSavingLevel] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await getExchangerConfig();
      const map = {};
      for (const cfg of res) {
        map[cfg.level] = cfg;
      }
      setConfigs(map);
    } catch (err) {
      console.error("❌ Failed to fetch exchanger config:", err);
      setError("Gagal memuat konfigurasi exchanger.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (level, field, value) => {
    setConfigs((prev) => ({
      ...prev,
      [level]: {
        ...prev[level],
        [field]: value,
      },
    }));
  };

  const handleSave = async (level) => {
    setSavingLevel(level);
    setError(null);
    setSuccess(null);

    const payload = {
      level,
      bonusAsset: configs[level]?.bonusAsset || null,
      bonusPercent: parseFloat(configs[level]?.bonusPercent || 0),
      bonusDescription: configs[level]?.bonusDescription || "",
    };

    try {
      await updateExchangerConfig(payload);
      setSuccess(`Konfigurasi untuk level ${level} berhasil disimpan.`);
    } catch (err) {
      console.error(`❌ Gagal menyimpan konfigurasi level ${level}:`, err);
      setError(`Gagal menyimpan konfigurasi untuk level ${level}.`);
    } finally {
      setSavingLevel(null);
    }
  };

  if (loading) {
    return <Spinner animation="border" variant="light" />;
  }

  return (
    <>
      <h4 className="text-white mb-3">Bonus Exchanger per Level</h4>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {LEVELS.map((level) => {
        const form = configs[level] || { level };

        return (
          <Card className="bg-dark text-white mb-4" key={level}>
            <Card.Body>
              <h5 className="mb-3 text-capitalize">{level} Level</h5>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Bonus Aset</Form.Label>
                    <Form.Select
                      value={form.bonusAsset || ""}
                      onChange={(e) =>
                        handleChange(level, "bonusAsset", e.target.value)
                      }
                    >
                      <option value="">Pilih Aset</option>
                      <option value="SBP">SBP</option>
                      <option value="RACE">RACE</option>
                      <option value="TBP">TBP</option>
                      <option value="IDR">Rupiah</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Persentase Bonus (%)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.1"
                      value={form.bonusPercent || ""}
                      onChange={(e) =>
                        handleChange(level, "bonusPercent", e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col>
                  <Form.Group>
                    <Form.Label>Keterangan Bonus</Form.Label>
                    <Form.Control
                      type="text"
                      value={form.bonusDescription || ""}
                      onChange={(e) =>
                        handleChange(level, "bonusDescription", e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button
                variant="primary"
                onClick={() => handleSave(level)}
                disabled={savingLevel === level}
              >
                {savingLevel === level ? "Menyimpan..." : "Simpan Konfigurasi"}
              </Button>
            </Card.Body>
          </Card>
        );
      })}
    </>
  );
}

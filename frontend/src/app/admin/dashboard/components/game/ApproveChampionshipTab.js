"use client";

import {
  approveChampionshipRequest,
  getPendingChampionshipRequests,
} from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";

export default function ApproveChampionshipTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [formValues, setFormValues] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getPendingChampionshipRequests();
      setRequests(data);

      // Inisialisasi nilai form untuk tiap request
      const defaultForms = {};
      data.forEach((req) => {
        defaultForms[req.id] = {
          registrationFeeAmount: 0,
          registrationFeeCurrency: "SBP",
          rewardAmount1: 0,
          rewardCurrency1: "SBP",
          rewardAmount2: 0,
          rewardCurrency2: "SBP",
          rewardAmount3: 0,
          rewardCurrency3: "SBP",
          ownerCompensationAmount: 0,
          ownerCompensationCurrency: "SBP",
        };
      });
      setFormValues(defaultForms);
    } catch (err) {
      console.error("❌ Gagal fetch request championship", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (id, field, value) => {
    setFormValues((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleApprove = async (id) => {
    try {
      setProcessingId(id);
      const payload = formValues[id];
      await approveChampionshipRequest(id, payload);
      alert("✅ Championship approved!");
      fetchData();
    } catch (err) {
      alert("❌ Gagal menyetujui: " + (err?.response?.data?.error || "Unknown error"));
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h3 className="text-xl font-bold mb-3">Pending Championship Requests</h3>
      {requests.length === 0 ? (
        <p className="text-gray-300">Tidak ada permintaan baru.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const form = formValues[req.id] || {};
            return (
              <div key={req.id} className="p-4 bg-white text-black rounded shadow">
                <div className="font-bold text-lg">{req.title}</div>
                <div className="text-sm mb-2">{req.description}</div>
                <div className="text-sm mb-3">
                  Jadwal: {new Date(req.scheduledAt).toLocaleString()}
                </div>

                {/* Form Input */}
                <Form>
                  <Form.Group className="mb-2">
                    <Form.Label>Biaya Pendaftaran</Form.Label>
                    <div className="d-flex gap-2">
                      <Form.Control
                        type="number"
                        value={form.registrationFeeAmount}
                        onChange={(e) =>
                          handleInputChange(req.id, "registrationFeeAmount", e.target.value)
                        }
                      />
                      <Form.Select
                        value={form.registrationFeeCurrency}
                        onChange={(e) =>
                          handleInputChange(req.id, "registrationFeeCurrency", e.target.value)
                        }
                      >
                        <option>SBP</option>
                        <option>TBP</option>
                        <option>RACE</option>
                        <option>RUPIAH</option>
                      </Form.Select>
                    </div>
                  </Form.Group>

                  {[1, 2, 3].map((pos) => (
                    <Form.Group key={pos} className="mb-2">
                      <Form.Label>Hadiah Juara {pos}</Form.Label>
                      <div className="d-flex gap-2">
                        <Form.Control
                          type="number"
                          value={form[`rewardAmount${pos}`]}
                          onChange={(e) =>
                            handleInputChange(req.id, `rewardAmount${pos}`, e.target.value)
                          }
                        />
                        <Form.Select
                          value={form[`rewardCurrency${pos}`]}
                          onChange={(e) =>
                            handleInputChange(req.id, `rewardCurrency${pos}`, e.target.value)
                          }
                        >
                          <option>SBP</option>
                          <option>TBP</option>
                          <option>RACE</option>
                          <option>RUPIAH</option>
                        </Form.Select>
                      </div>
                    </Form.Group>
                  ))}

                  <Form.Group className="mb-2">
                    <Form.Label>Kompensasi Circuit Owner</Form.Label>
                    <div className="d-flex gap-2">
                      <Form.Control
                        type="number"
                        value={form.ownerCompensationAmount}
                        onChange={(e) =>
                          handleInputChange(req.id, "ownerCompensationAmount", e.target.value)
                        }
                      />
                      <Form.Select
                        value={form.ownerCompensationCurrency}
                        onChange={(e) =>
                          handleInputChange(req.id, "ownerCompensationCurrency", e.target.value)
                        }
                      >
                        <option>SBP</option>
                        <option>TBP</option>
                        <option>RACE</option>
                        <option>RUPIAH</option>
                      </Form.Select>
                    </div>
                  </Form.Group>
                </Form>

                <Button
                  className="mt-2"
                  onClick={() => handleApprove(req.id)}
                  disabled={processingId === req.id}
                >
                  {processingId === req.id ? "Memproses..." : "Setujui"}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// src/app/admin/dashboard/components/airdrop/AirdropParticipantModal.js
"use client";

import apiClient from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Form, Modal, Spinner, Table } from "react-bootstrap";

export default function AirdropParticipantModal({ scheduleId, onClose, refreshList }) {
  const [data, setData] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    setLoading(true);
    const res = await apiClient.get(`/admin/airdrop/schedule/${scheduleId}`);
    setData(res.data);
    setSelectedUserIds([]);
    setLoading(false);
  };

  useEffect(() => {
    fetchDetail();
  }, [scheduleId]);

  const toggleSelect = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const approveSelected = async () => {
    await apiClient.post(`/admin/airdrop/${scheduleId}/approve`, { userIds: selectedUserIds });
    fetchDetail();
  };

  const approveFirstN = async (n) => {
    const pending = data.participants.filter(p => p.status === "PENDING").slice(0, n);
    await apiClient.post(`/admin/airdrop/${scheduleId}/approve`, { userIds: pending.map(p => p.userId) });
    fetchDetail();
  };

  const approveRandomN = async (n) => {
    const pending = data.participants.filter(p => p.status === "PENDING");
    const shuffled = pending.sort(() => 0.5 - Math.random()).slice(0, n);
    await apiClient.post(`/admin/airdrop/${scheduleId}/approve`, { userIds: shuffled.map(p => p.userId) });
    fetchDetail();
  };

  const distribute = async () => {
    await apiClient.post(`/admin/airdrop/${scheduleId}/distribute`);
    onClose();
    refreshList();
  };

  if (loading || !data) return <Spinner animation="border" />;

  return (
    <Modal show onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Detail Airdrop: {data.schedule.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>Quota:</strong> {data.schedule.totalQuota} | <strong>Deadline:</strong> {new Date(data.schedule.deadline).toLocaleString()}</p>

        <div className="d-flex gap-2 mb-2">
          <Button size="sm" onClick={approveSelected} disabled={selectedUserIds.length === 0}>✅ Approve Selected</Button>
          <Button size="sm" onClick={() => approveFirstN(50)}>🔢 Approve First 50</Button>
          <Button size="sm" onClick={() => approveRandomN(50)}>🎯 Approve Random 50</Button>
          <Button size="sm" variant="success" onClick={distribute}>🚀 Distribute</Button>
        </div>

        <Table striped bordered size="sm">
          <thead>
            <tr>
              <th></th>
              <th>User</th>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.participants.map((p) => (
              <tr key={p.userId}>
                <td>
                  <Form.Check
                    type="checkbox"
                    disabled={p.status !== "PENDING"}
                    checked={selectedUserIds.includes(p.userId)}
                    onChange={() => toggleSelect(p.userId)}
                  />
                </td>
                <td>{p.user?.username}</td>
                <td>{p.user?.email}</td>
                <td>{p.status}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>
    </Modal>
  );
}

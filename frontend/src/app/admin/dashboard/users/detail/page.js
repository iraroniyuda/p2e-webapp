// src/app/admin/dashboard/users/UserDetail.js
"use client";

import { Button, Card } from "react-bootstrap";

const userDetail = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  status: "Active",
  role: "user",
  referralCode: "ABC123",
  upline: "Jane Smith",
};

export default function UserDetail() {
  return (
    <Card className="p-3 text-dark bg-light">
      <h2>Detail Pengguna</h2>
      <p><strong>Nama:</strong> {userDetail.name}</p>
      <p><strong>Email:</strong> {userDetail.email}</p>
      <p><strong>Status:</strong> {userDetail.status}</p>
      <p><strong>Role:</strong> {userDetail.role}</p>
      <p><strong>Referral Code:</strong> {userDetail.referralCode}</p>
      <p><strong>Upline:</strong> {userDetail.upline}</p>
      <Button variant="primary">Kembali</Button>
    </Card>
  );
}

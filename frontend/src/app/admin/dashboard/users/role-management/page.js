// src/app/admin/dashboard/users/UserRoleManagement.js
"use client";

import { Button, Form } from "react-bootstrap";

const roles = ["user", "elite", "exchanger", "marshall", "customer service"];

export default function UserRoleManagement() {
  return (
    <div>
      <h2>Pengaturan Role Pengguna</h2>
      <Form>
        <Form.Group>
          <Form.Label>Nama Role Baru</Form.Label>
          <Form.Control type="text" placeholder="Masukkan nama role baru" />
        </Form.Group>
        <Button variant="primary" className="mt-3" onClick={() => alert("Role Ditambahkan")}>
          Tambahkan Role
        </Button>
      </Form>

      <h4 className="mt-4">Role yang Tersedia</h4>
      <ul>
        {roles.map((role, index) => (
          <li key={index}>{role}</li>
        ))}
      </ul>
    </div>
  );
}

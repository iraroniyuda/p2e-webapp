// src/app/admin/dashboard/users/UserSuspension.js
"use client";

import { Button, ListGroup } from "react-bootstrap";

const suspendedUsers = [
  { id: 3, name: "Mike Johnson", email: "mike@example.com" },
];

export default function UserSuspension() {
  return (
    <div>
      <h2>Suspensi Akun Pengguna</h2>
      <ListGroup>
        {suspendedUsers.map((user) => (
          <ListGroup.Item key={user.id} className="d-flex justify-content-between align-items-center">
            {user.name} ({user.email})
            <Button variant="danger" onClick={() => alert("User Unsuspended")}>
              Cabut Suspensi
            </Button>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}

// src/components/layout/AdminNavbar.js
"use client";
import { useRouter } from "next/navigation";
import { Container, Nav, Navbar } from "react-bootstrap";

export default function AdminNavbar() {
  const router = useRouter();
  const logout = () => {
    router.push("/signin");
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="/admin/dashboard">Admin Dashboard</Navbar.Brand>
        <Nav className="ml-auto">
          <Nav.Link href="/admin/dashboard">Dashboard</Nav.Link>
          <Nav.Link href="#" onClick={logout}>Logout</Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
}

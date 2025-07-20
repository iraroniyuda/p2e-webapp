"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Container, Nav, Spinner, Tab } from "react-bootstrap";

import AdminSidebar from "../../components/AdminSidebar";
import CmsHomeBannerTab from "../../components/cms/home/CmsHomeBannerTab";
import CmsHomeContentTab from "../../components/cms/home/CmsHomeContentTab";
import CmsHomeImageTab from "../../components/cms/home/CmsHomeImageTab";
import CmsHomeTestimonialTab from "../../components/cms/home/CmsHomeTestimonialTab";

export default function CmsHomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeKey, setActiveKey] = useState("content");

  // ❌ Redirect jika bukan admin
  if (!loading && (!user || user.role !== "admin")) {
    if (typeof window !== "undefined") {
      window.location.href = "/signin";
    }
    return null;
  }

  // ⏳ Spinner saat loading
  if (loading || !user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container
      fluid
      className="d-flex"
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/images/bg-dashboard.png')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <AdminSidebar />

      <div className="flex-grow-1 p-4 text-white">
        <h1 className="mb-4 text-2xl font-bold">Manajemen CMS: Halaman Home</h1>

        <Tab.Container activeKey={activeKey} onSelect={(k) => setActiveKey(k)}>
          <Nav variant="tabs" className="mb-4">
            <Nav.Item>
              <Nav.Link eventKey="content">Konten Utama</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="banner">Carousel Banner</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="testimonial">Testimonial</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="image">Running Media Image</Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            <Tab.Pane eventKey="content">
              <CmsHomeContentTab />
            </Tab.Pane>
            <Tab.Pane eventKey="banner">
              <CmsHomeBannerTab />
            </Tab.Pane>
            <Tab.Pane eventKey="testimonial">
              <CmsHomeTestimonialTab />
            </Tab.Pane>
            <Tab.Pane eventKey="image">
              <CmsHomeImageTab />
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </div>
    </Container>
  );
}

"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Form, Modal, Table } from "react-bootstrap";
import AdminSidebar from "../components/AdminSidebar";

export default function ContentManagementPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Dummy Data untuk Konten Pengumuman
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: "Event Balapan Akhir Pekan", content: "Dapatkan hadiah token TBP dalam event ini.", date: "2025-05-12" },
    { id: 2, title: "Update Sistem Referral", content: "Peningkatan bonus referral untuk pengguna baru.", date: "2025-05-10" },
  ]);

  // State untuk modal tambah/edit pengumuman
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [announcementData, setAnnouncementData] = useState({
    title: "",
    content: "",
  });

  // Fungsi untuk membuka modal tambah/edit
  const handleOpenModal = (announcement = null) => {
    setIsEdit(!!announcement);
    setSelectedAnnouncement(announcement);
    setAnnouncementData(announcement || { title: "", content: "" });
    setShowModal(true);
  };

  // Fungsi untuk menyimpan pengumuman
  const handleSaveAnnouncement = () => {
    if (isEdit && selectedAnnouncement) {
      setAnnouncements((prev) =>
        prev.map((ann) =>
          ann.id === selectedAnnouncement.id
            ? { ...ann, ...announcementData }
            : ann
        )
      );
      alert("Pengumuman berhasil diubah.");
    } else {
      setAnnouncements((prev) => [
        ...prev,
        { id: Date.now(), ...announcementData, date: new Date().toISOString().split("T")[0] },
      ]);
      alert("Pengumuman berhasil ditambahkan.");
    }
    setShowModal(false);
  };

  // Fungsi untuk menghapus pengumuman
  const handleDeleteAnnouncement = (id) => {
    setAnnouncements((prev) => prev.filter((ann) => ann.id !== id));
    alert("Pengumuman berhasil dihapus.");
  };

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div
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
        <h1>Manajemen Konten</h1>

        {/* Section 1: Pengumuman */}
        <div className="mb-4">
          <h2>Pengumuman</h2>
          <Button variant="primary" className="mb-3" onClick={() => handleOpenModal()}>
            Tambah Pengumuman
          </Button>

          <Table variant="light" striped bordered hover>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Judul</th>
                <th>Isi</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((ann) => (
                <tr key={ann.id}>
                  <td>{ann.date}</td>
                  <td>{ann.title}</td>
                  <td>{ann.content}</td>
                  <td>
                    <Button
                      variant="info"
                      size="sm"
                      className="me-2"
                      onClick={() => handleOpenModal(ann)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                    >
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Modal Tambah/Edit Pengumuman */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{isEdit ? "Edit Pengumuman" : "Tambah Pengumuman"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Judul Pengumuman</Form.Label>
                <Form.Control
                  type="text"
                  value={announcementData.title}
                  onChange={(e) => setAnnouncementData({ ...announcementData, title: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Isi Pengumuman</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={announcementData.content}
                  onChange={(e) => setAnnouncementData({ ...announcementData, content: e.target.value })}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSaveAnnouncement}>
              Simpan
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

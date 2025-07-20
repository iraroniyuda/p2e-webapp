"use client";

import {
  createAdminCmsTestimonial,
  deleteAdminCmsTestimonial,
  getAdminCmsTestimonials,
  updateAdminCmsTestimonial,
} from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Form, Modal, Spinner, Table } from "react-bootstrap";

export default function CmsHomeTestimonialTab() {
  const [loading, setLoading] = useState(true);
  const [testimonials, setTestimonials] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", role: "", message: "" });
  const [file, setFile] = useState(null);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const data = await getAdminCmsTestimonials();
      setTestimonials(data);
    } catch (err) {
      alert("❌ Gagal mengambil testimonial");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      let mediaUrl = editing?.mediaUrl || "";

      if (file) {
        const formData = new FormData();
        formData.append("file", file); // 🔧 pakai "file" bukan "image" (menyesuaikan controller)
        const uploadRes = await fetch("/api/admin/cms/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.message || "Upload gagal");
        mediaUrl = uploadData.url;
      }

      const payload = {
        name: form.name,
        title: form.role,
        content: form.message,
        imageUrl: mediaUrl,
      };

      if (editing) {
        await updateAdminCmsTestimonial(editing.id, payload);
      } else {
        await createAdminCmsTestimonial(payload);
      }

      setShowModal(false);
      setForm({ name: "", role: "", message: "" });
      setFile(null);
      setEditing(null);
      fetchTestimonials();
    } catch (err) {
      alert("❌ Gagal menyimpan testimonial");
    }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.title || "",       // title digunakan untuk nama
      role: item.linkUrl || "",     // linkUrl digunakan untuk jabatan/caption
      message: item.content || "",  // content = pesan
    });
    setFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus testimonial ini?")) return;
    try {
      await deleteAdminCmsTestimonial(id);
      fetchTestimonials();
    } catch (err) {
      alert("❌ Gagal menghapus testimonial");
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  return (
    <div className="text-white">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>👥 Testimonial Pengguna</h5>
        <Button onClick={() => {
          setEditing(null);
          setForm({ name: "", role: "", message: "" });
          setFile(null);
          setShowModal(true);
        }}>
          + Tambah Testimonial
        </Button>
      </div>

      {loading ? (
        <Spinner animation="border" variant="light" />
      ) : (
        <Table striped bordered hover variant="dark" responsive>
          <thead>
            <tr>
              <th>Foto</th>
              <th>Nama</th>
              <th>Jabatan</th>
              <th>Pesan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {testimonials.map((item) => (
              <tr key={item.id}>
                <td>
                  <img src={item.mediaUrl} alt="foto" style={{ width: "70px", borderRadius: "50%" }} />
                </td>
                <td>{item.title}</td>
                <td>{item.linkUrl}</td>
                <td>{item.content}</td>
                <td>
                  <Button size="sm" variant="warning" onClick={() => handleEdit(item)}>Edit</Button>{" "}
                  <Button size="sm" variant="danger" onClick={() => handleDelete(item.id)}>Hapus</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editing ? "Edit Testimonial" : "Tambah Testimonial"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nama</Form.Label>
            <Form.Control
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Jabatan (caption singkat)</Form.Label>
            <Form.Control
              type="text"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Pesan / Testimonial</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Upload Foto</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
            />
            {editing?.mediaUrl && (
              <div className="mt-2">
                <small>Foto saat ini:</small>
                <br />
                <img src={editing.mediaUrl} alt="preview" style={{ maxWidth: "100px", borderRadius: "6px" }} />
              </div>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Batal</Button>
          <Button variant="primary" onClick={handleSubmit}>Simpan</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

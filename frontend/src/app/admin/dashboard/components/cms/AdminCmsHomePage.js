"use client";

import {
    createAdminCmsContent,
    deleteAdminCmsContent,
    getAdminCmsContents,
    updateAdminCmsContent,
} from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Form, Modal, Spinner, Table } from "react-bootstrap";

export default function AdminCmsHomePage() {
  const [loading, setLoading] = useState(true);
  const [contents, setContents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ section: "", title: "", content: "", mediaUrl: "" });

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getAdminCmsContents();
      const filtered = data.filter((item) => item.page === "home");
      setContents(filtered);
    } catch (err) {
      alert("Gagal memuat data konten home");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingItem) {
        await updateAdminCmsContent(editingItem.id, { ...form, page: "home" });
      } else {
        await createAdminCmsContent({ ...form, page: "home" });
      }
      setShowModal(false);
      setEditingItem(null);
      fetchData();
    } catch (err) {
      alert("Gagal menyimpan data.");
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setForm({ section: item.section, title: item.title || "", content: item.content || "", mediaUrl: item.mediaUrl || "" });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus item ini?")) return;
    try {
      await deleteAdminCmsContent(id);
      fetchData();
    } catch (err) {
      alert("Gagal menghapus item.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container mt-4 text-white">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Manajemen Konten: Home</h3>
        <Button onClick={() => { setForm({ section: "", title: "", content: "", mediaUrl: "" }); setEditingItem(null); setShowModal(true); }}>+ Tambah</Button>
      </div>

      {loading ? (
        <Spinner animation="border" variant="light" />
      ) : (
        <Table striped bordered hover responsive variant="dark">
          <thead>
            <tr>
              <th>Section</th>
              <th>Judul</th>
              <th>Konten</th>
              <th>Media URL</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {contents.map((item) => (
              <tr key={item.id}>
                <td>{item.section}</td>
                <td>{item.title}</td>
                <td>{item.content?.slice(0, 50)}...</td>
                <td>{item.mediaUrl}</td>
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
          <Modal.Title>{editingItem ? "Edit Konten" : "Tambah Konten"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Section</Form.Label>
              <Form.Control type="text" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Judul</Form.Label>
              <Form.Control type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Konten (HTML/Rich Text)</Form.Label>
              <Form.Control as="textarea" rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Media URL (jika ada)</Form.Label>
              <Form.Control type="text" value={form.mediaUrl} onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Batal</Button>
          <Button variant="primary" onClick={handleSubmit}>Simpan</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

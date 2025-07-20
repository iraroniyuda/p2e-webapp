"use client";

import {
  createAdminCmsBanner,
  deleteAdminCmsBanner,
  getAdminCmsBanners,
  updateAdminCmsBanner,
} from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Form, Modal, Spinner, Table } from "react-bootstrap";

export default function CmsHomeBannerTab() {
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", linkUrl: "", position: 0 });
  const [file, setFile] = useState(null);
  const [editing, setEditing] = useState(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await getAdminCmsBanners();
      setBanners(data);
    } catch (err) {
      alert("❌ Gagal mengambil banner");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      let mediaUrl = editing?.mediaUrl || "";

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/admin/cms/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.message || "Upload gagal");

        mediaUrl = uploadData.url;
      }

      const payload = {
        title: form.title,
        linkUrl: form.linkUrl,
        position: parseInt(form.position) || 0,
        imageUrl: mediaUrl, // Sesuai backend controller: field ini dipakai
      };

      if (editing) {
        await updateAdminCmsBanner(editing.id, payload);
      } else {
        await createAdminCmsBanner(payload);
      }

      setShowModal(false);
      setForm({ title: "", linkUrl: "", position: 0 });
      setFile(null);
      setEditing(null);
      fetchBanners();
    } catch (err) {
      console.error(err);
      alert("❌ Gagal menyimpan banner");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus banner ini?")) return;
    try {
      await deleteAdminCmsBanner(id);
      fetchBanners();
    } catch (err) {
      alert("❌ Gagal menghapus banner");
    }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title || "",
      linkUrl: item.linkUrl || "",
      position: item.position || 0,
    });
    setShowModal(true);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return (
    <div className="text-white">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>🖼️ Carousel Banner</h5>
        <Button
          onClick={() => {
            setEditing(null);
            setForm({ title: "", linkUrl: "", position: 0 });
            setFile(null);
            setShowModal(true);
          }}
        >
          + Tambah Banner
        </Button>
      </div>

      {loading ? (
        <Spinner animation="border" variant="light" />
      ) : (
        <Table striped bordered hover variant="dark" responsive>
          <thead>
            <tr>
              <th>Preview</th>
              <th>Caption</th>
              <th>Link</th>
              <th>Urutan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {banners.map((item) => (
              <tr key={item.id}>
                <td>
                  <img
                    src={item.mediaUrl}
                    alt="banner"
                    style={{ width: "100px", borderRadius: "6px" }}
                  />
                </td>
                <td>{item.title}</td>
                <td>{item.linkUrl}</td>
                <td>{item.position}</td>
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
          <Modal.Title>{editing ? "Edit Banner" : "Tambah Banner"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Caption</Form.Label>
            <Form.Control
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Link (opsional)</Form.Label>
            <Form.Control
              type="text"
              value={form.linkUrl}
              onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Urutan</Form.Label>
            <Form.Control
              type="number"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Upload Gambar</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
            />
            {editing?.mediaUrl && (
              <div className="mt-2">
                <small>Gambar saat ini:</small>
                <br />
                <img
                  src={editing.mediaUrl}
                  alt="preview"
                  style={{ maxWidth: "150px", borderRadius: "4px" }}
                />
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

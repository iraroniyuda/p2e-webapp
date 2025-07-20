"use client";

import apiClient from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";

export default function CmsHomeImageTab() {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

const fetchImages = async () => {
  try {
    const res = await apiClient.get("/admin/cms/running-media/list");
    setImages(res.data.files || []);
  } catch (err) {
    alert("❌ Gagal memuat gambar");
  } finally {
    setLoading(false);
  }
};

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/admin/upload-running-media", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Upload gagal");

      setFile(null);
      await fetchImages();
    } catch (err) {
      alert("❌ Gagal upload gambar");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename) => {
    if (!confirm("Hapus gambar ini?")) return;
    try {
      await fetch(`/api/admin/running-media/delete?file=${encodeURIComponent(filename)}`, {
        method: "DELETE",
      });
      await fetchImages();
    } catch (err) {
      alert("❌ Gagal hapus gambar");
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div className="text-white">
      <h5 className="mb-3">🖼️ Gambar Berjalan (Running Media)</h5>

      <Form className="mb-4 d-flex flex-column flex-md-row align-items-start gap-3">
        <Form.Control
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <Button onClick={handleUpload} disabled={uploading || !file}>
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </Form>

      {loading ? (
        <Spinner animation="border" variant="light" />
      ) : (
        <div className="d-flex flex-wrap gap-3">
          {images.map((filename, index) => (
            <div key={index} className="text-center">
              <img
                src={`/images/running-media/${filename}`}
                alt="media"
                style={{ height: "160px", objectFit: "cover", borderRadius: "8px" }}
              />
              <Button
                variant="danger"
                size="sm"
                className="mt-2"
                onClick={() => handleDelete(filename)}
              >
                Hapus
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

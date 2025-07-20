"use client";

import {
  createAdminCmsContent,
  getAdminCmsContents,
  updateAdminCmsContent,
} from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";

// Utility: normalize content object
const normalizeContent = (obj) => ({
  id: obj?.id || null,
  title: obj?.title || "",
  content: obj?.content || "",
});

export default function CmsHomeContentTab() {
  const [loading, setLoading] = useState(true);
  const [aboutContent, setAboutContent] = useState(normalizeContent({}));
  const [videoContent, setVideoContent] = useState(normalizeContent({}));

  const fetchContent = async () => {
    setLoading(true);
    try {
      const data = await getAdminCmsContents();

      if (process.env.NODE_ENV === "development") {
        console.log("📦 DATA CMS:", data);
        data.forEach((item, i) =>
          console.log(`Row ${i + 1}:`, item.page, item.section, item.title)
        );
      }

      const about = data.find(
        (d) => d.page?.toLowerCase() === "home" && d.section?.toLowerCase() === "about"
      );
      const video = data.find(
        (d) => d.page?.toLowerCase() === "home" && d.section?.toLowerCase() === "video"
      );

      setAboutContent(normalizeContent(about));
      setVideoContent(normalizeContent(video));
    } catch (err) {
      console.error("❌ Gagal mengambil konten CMS:", err);
      alert("❌ Gagal mengambil konten CMS");
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async (type) => {
    try {
      const payload = {
        page: "home",
        section: type,
        ...(type === "about" ? aboutContent : videoContent),
      };

      if (payload.id) {
        await updateAdminCmsContent(payload.id, payload);
      } else {
        await createAdminCmsContent(payload);
      }

      alert("✅ Konten berhasil disimpan");
      fetchContent();
    } catch (err) {
      console.error("❌ Gagal menyimpan konten:", err);
      alert("❌ Gagal menyimpan konten");
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  if (loading) return <Spinner animation="border" variant="light" />;

  return (
    <div className="text-white">
      {/* 🧩 ABOUT SECTION */}
      <h5 className="mb-3">🧩 Section: Tentang </h5>
      <Form className="mb-5">
        <Form.Group className="mb-3">
          <Form.Label>Judul</Form.Label>
          <Form.Control
            type="text"
            value={aboutContent.title}
            onChange={(e) => setAboutContent({ ...aboutContent, title: e.target.value })}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Konten (HTML/Rich)</Form.Label>
          <Form.Control
            as="textarea"
            rows={6}
            value={aboutContent.content}
            onChange={(e) => setAboutContent({ ...aboutContent, content: e.target.value })}
          />
        </Form.Group>
        <Button variant="primary" onClick={() => saveContent("about")}>
          Simpan Konten Tentang 
        </Button>
      </Form>

      {/* 🎥 VIDEO SECTION */}
      <h5 className="mb-3">🎥 Section: Video</h5>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Judul</Form.Label>
          <Form.Control
            type="text"
            value={videoContent.title}
            onChange={(e) => setVideoContent({ ...videoContent, title: e.target.value })}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Embed Video URL (misal YouTube)</Form.Label>
          <Form.Control
            type="text"
            value={videoContent.content}
            onChange={(e) => setVideoContent({ ...videoContent, content: e.target.value })}
          />
        </Form.Group>
        <Button variant="primary" onClick={() => saveContent("video")}>
          Simpan Konten Video
        </Button>
      </Form>
    </div>
  );
}

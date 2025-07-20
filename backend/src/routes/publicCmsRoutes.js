const express = require("express");
const router = express.Router();
const CmsContent = require("../models/CmsContent");
const fs = require("fs");
const path = require("path");

// Konten Umum (about, video)
router.get("/content/home", async (req, res) => {
  try {
    const data = await CmsContent.findAll({ where: { page: "home" } });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Gagal ambil konten" });
  }
});

// Banner
router.get("/banner", async (req, res) => {
  try {
    const data = await CmsContent.findAll({ where: { page: "home", section: "banner" }, order: [["position", "ASC"]] });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Gagal ambil banner" });
  }
});

// Testimonial
router.get("/testimonial", async (req, res) => {
  try {
    const data = await CmsContent.findAll({ where: { page: "home", section: "testimonial" }, order: [["position", "ASC"]] });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Gagal ambil testimonial" });
  }
});

// Running media
router.get("/running-media", async (req, res) => {
  try {
    const dir = path.join(__dirname, "../../frontend/public/images/running-media");
    const files = fs.readdirSync(dir);
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: "Gagal ambil gambar" });
  }
});

module.exports = router;

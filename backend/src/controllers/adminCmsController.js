const path = require("path");
const fs = require("fs");
const multer = require("multer");
const CmsContent = require("../models/CmsContent");

// 📌 CRUD CMS CONTENT
exports.getAllCmsContents = async (req, res) => {
  try {
    const data = await CmsContent.findAll({ order: [["position", "ASC"]] });
    console.log("🧪 Data CMSContent ditemukan:", data); // Ini akan kosong jika field tidak terdaftar di model
    res.json(data);
  } catch (err) {
    console.error("❌ getAllCmsContents:", err);
    res.status(500).json({ error: "Gagal mengambil data konten CMS" });
  }
};




exports.createCmsContent = async (req, res) => {
  try {
    const payload = req.body;
    payload.page = payload.page?.toLowerCase();
    payload.section = payload.section?.toLowerCase();

    const created = await CmsContent.create(payload);
    res.json(created);
  } catch (err) {
    console.error("❌ createCmsContent:", err);
    res.status(500).json({ error: "Gagal membuat konten CMS" });
  }
};

exports.updateCmsContent = async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body;
    payload.page = payload.page?.toLowerCase();
    payload.section = payload.section?.toLowerCase();

    const content = await CmsContent.findByPk(id);
    if (!content) return res.status(404).json({ error: "Konten tidak ditemukan" });

    await content.update(payload);
    res.json(content);
  } catch (err) {
    console.error("❌ updateCmsContent:", err);
    res.status(500).json({ error: "Gagal mengupdate konten CMS" });
  }
};


exports.deleteCmsContent = async (req, res) => {
  try {
    const id = req.params.id;
    const content = await CmsContent.findByPk(id);
    if (!content) return res.status(404).json({ error: "Konten tidak ditemukan" });

    await content.destroy();
    res.json({ message: "Berhasil dihapus" });
  } catch (err) {
    console.error("❌ deleteCmsContent:", err);
    res.status(500).json({ error: "Gagal menghapus konten CMS" });
  }
};

//
// 🖼 UPLOAD IMAGE/VIDEO KE VPS: /public/images
//

const uploadDir = "";

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },  // Maksimal ukuran file 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."), false);
    }
  }
});


exports.uploadCmsMedia = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error("❌ uploadCmsMedia:", err);
      return res.status(400).json({ error: err.message });
    }

    const filename = req.file.filename;
    const url = ``;
    res.json({ url });
  });
};


exports.getCmsBanners = async (req, res) => {
  try {
    const data = await CmsContent.findAll({
      where: { page: "home", section: "banner" },
      order: [["position", "ASC"]],
    });
    res.json(data);
  } catch (err) {
    console.error("❌ getCmsBanners:", err);
    res.status(500).json({ error: "Gagal mengambil banner" });
  }
};

exports.createCmsBanner = async (req, res) => {
  try {
    const payload = {
      page: "home",
      section: "banner",
      title: null,
      content: null,
      mediaUrl: req.body.imageUrl,
      linkUrl: req.body.linkUrl || null,
      position: req.body.order || 0,
    };
    const result = await CmsContent.create(payload);
    res.json(result);
  } catch (err) {
    console.error("❌ createCmsBanner:", err);
    res.status(500).json({ error: "Gagal menambah banner" });
  }
};

exports.updateCmsBanner = async (req, res) => {
  try {
    const banner = await CmsContent.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ error: "Banner tidak ditemukan" });

    await banner.update({
      mediaUrl: req.body.imageUrl,
      linkUrl: req.body.linkUrl,
      position: req.body.order,
    });

    res.json(banner);
  } catch (err) {
    console.error("❌ updateCmsBanner:", err);
    res.status(500).json({ error: "Gagal update banner" });
  }
};

exports.deleteCmsBanner = async (req, res) => {
  try {
    const banner = await CmsContent.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ error: "Banner tidak ditemukan" });

    await banner.destroy();
    res.json({ message: "Banner dihapus" });
  } catch (err) {
    console.error("❌ deleteCmsBanner:", err);
    res.status(500).json({ error: "Gagal hapus banner" });
  }
};


// ✅ TESTIMONIALS
exports.getCmsTestimonials = async (req, res) => {
  try {
    const data = await CmsContent.findAll({
      where: { page: "home", section: "testimonial" },
      order: [["position", "ASC"]],
    });
    res.json(data);
  } catch (err) {
    console.error("❌ getCmsTestimonials:", err);
    res.status(500).json({ error: "Gagal mengambil testimonial" });
  }
};

exports.createCmsTestimonial = async (req, res) => {
  try {
    const payload = {
      page: "home",
      section: "testimonial",
      title: req.body.name,
      content: req.body.message,
      mediaUrl: req.body.imageUrl || null,
      linkUrl: null,
      position: 0,
    };
    const result = await CmsContent.create(payload);
    res.json(result);
  } catch (err) {
    console.error("❌ createCmsTestimonial:", err);
    res.status(500).json({ error: "Gagal membuat testimonial" });
  }
};

exports.updateCmsTestimonial = async (req, res) => {
  try {
    const item = await CmsContent.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "Testimonial tidak ditemukan" });

    await item.update({
      title: req.body.name,
      content: req.body.message,
      mediaUrl: req.body.imageUrl,
    });

    res.json(item);
  } catch (err) {
    console.error("❌ updateCmsTestimonial:", err);
    res.status(500).json({ error: "Gagal mengupdate testimonial" });
  }
};

exports.deleteCmsTestimonial = async (req, res) => {
  try {
    const item = await CmsContent.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "Testimonial tidak ditemukan" });

    await item.destroy();
    res.json({ message: "Berhasil dihapus" });
  } catch (err) {
    console.error("❌ deleteCmsTestimonial:", err);
    res.status(500).json({ error: "Gagal menghapus testimonial" });
  }
};

// ✅ RUNNING MEDIA
const runningMediaDir = "";


if (!fs.existsSync(runningMediaDir)) fs.mkdirSync(runningMediaDir, { recursive: true });

const uploadRunning = multer({
  storage: multer.diskStorage({
    destination: (_, __, cb) => cb(null, runningMediaDir),
    filename: (_, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = `${Date.now()}-${Math.floor(Math.random() * 1e9)}${ext}`;
      cb(null, name);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Hanya file gambar diperbolehkan"), false);
    }
    cb(null, true);
  }
}).single("image");

exports.uploadRunningMedia = (req, res) => {
  uploadRunning(req, res, (err) => {
    if (err) {
      console.error("❌ uploadRunningMedia:", err);
      return res.status(400).json({ error: err.message });
    }
    res.json({ message: "Upload berhasil" });
  });
};

exports.listRunningMedia = async (req, res) => {
  try {
    const files = fs.readdirSync(runningMediaDir);
    res.json({ files });
  } catch (err) {
    console.error("❌ listRunningMedia:", err);
    res.status(500).json({ error: "Gagal membaca folder gambar" });
  }
};

exports.deleteRunningMedia = async (req, res) => {
  try {
    const filename = req.query.file;
    const filePath = path.join(runningMediaDir, filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File tidak ditemukan" });

    fs.unlinkSync(filePath);
    res.json({ message: "File berhasil dihapus" });
  } catch (err) {
    console.error("❌ deleteRunningMedia:", err);
    res.status(500).json({ error: "Gagal menghapus file" });
  }
};

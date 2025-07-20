// src/routes/adminCmsRoutes.js

const express = require("express");
const router = express.Router();
const {
  getAllCmsContents,
  createCmsContent,
  updateCmsContent,
  deleteCmsContent,
  uploadCmsMedia,
  getCmsBanners,
  createCmsBanner,
  updateCmsBanner,
  deleteCmsBanner,
  getCmsTestimonials,
  createCmsTestimonial,
  updateCmsTestimonial,
  deleteCmsTestimonial,
  listRunningMedia,
  uploadRunningMedia,
  deleteRunningMedia,
} = require("../controllers/adminCmsController");

const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");
router.use(verifyToken, verifyAdmin);

// 🔹 BANNER
router.get("/banners", getCmsBanners);
router.post("/banners", createCmsBanner);
router.put("/banners/:id", updateCmsBanner);
router.delete("/banners/:id", deleteCmsBanner);

// 🔹 TESTIMONIAL
router.get("/testimonials", getCmsTestimonials);
router.post("/testimonials", createCmsTestimonial);
router.put("/testimonials/:id", updateCmsTestimonial);
router.delete("/testimonials/:id", deleteCmsTestimonial);

// 🔹 RUNNING MEDIA IMAGE
router.get("/running-media/list", listRunningMedia);
router.post("/upload-running-media", uploadRunningMedia);
router.delete("/running-media/delete", deleteRunningMedia);

// ✅ Ganti endpoint menjadi sesuai frontend
router.get("/content", getAllCmsContents);
router.post("/content", createCmsContent);
router.put("/content/:id", updateCmsContent);
router.delete("/content/:id", deleteCmsContent);

// ✅ Endpoint tambahan untuk upload
router.post("/upload", uploadCmsMedia);

module.exports = router;

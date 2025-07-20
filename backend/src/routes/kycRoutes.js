const express = require("express");
const multer = require("multer");
const path = require("path");
const { verifyToken } = require("../middlewares/authMiddleware");
const { submitKycHandler, getKycStatusHandler, updateKycHandler } = require("../controllers/kycController");

const router = express.Router();
const uploadDir = path.resolve(__dirname, "../../public/kyc");

// Storage configuration for multer (store file in 'public/kyc')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);  // Set destination folder
  },
  filename: function (req, file, cb) {
    const uniqueName = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);  // Create unique filename
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },  // Max file size: 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("❌ Only image files are allowed."), false);  // Allow only images
    }
  }
});

// Helper function to validate file type
const validateFile = (file) => {
  if (!file) {
    throw new Error("❌ ID card image is required.");
  }
  if (!file.mimetype.startsWith("image/")) {
    throw new Error("❌ Only image files are allowed.");
  }
};

// Route to handle file upload and return URL
router.post("/submit", verifyToken, upload.single("id_card_image"), (req, res) => {
  try {
    const file = req.file;
    let fileUrl = null;

    if (file) {
      if (!file.mimetype.startsWith("image/")) {
        throw new Error("❌ Only image files are allowed.");
      }
      fileUrl = `${req.protocol}://${req.get("host")}/public/kyc/${file.filename}`;
    }

    // Kirim semua field dari req.body, biar flexible dan field apapun bisa dikirim
    submitKycHandler(req, res, fileUrl);

  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});





// Route to get KYC status
router.get("/status", verifyToken, getKycStatusHandler);

// Route to update KYC data
router.post("/update", verifyToken, upload.single("id_card_image"), updateKycHandler);


module.exports = router;

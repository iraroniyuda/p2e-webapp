const path = require("path");
const Tesseract = require("tesseract.js");
const User = require("../models/User");
const UserKycRequest = require("../models/UserKycRequest");

const PUBLIC_KYC_URL = "/api/public/kyc";

// Handle OCR for KTP image
// Backend handler (Express + Multer)
// Helper function to validate file (image)
// Helper function to validate file
const validateFile = (file) => {
  if (!file) {
    console.log("File tidak diterima di server!");  // Tambahkan log untuk verifikasi
    throw new Error("❌ ID card image is required.");
  }
  if (!file.mimetype.startsWith("image/")) {
    console.log("MIME type file salah:", file.mimetype);  // Log tipe MIME
    throw new Error("❌ Only image files are allowed.");
  }
};


const ocrKtpHandler = async (req, res) => {
  try {
    const file = req.file;
    validateFile(file);  // Validasi file

    const imagePath = file.path;
    console.log("Memulai OCR pada file:", imagePath);

    // Proses OCR dengan Tesseract
    const { data: { text } } = await Tesseract.recognize(imagePath, "ind");
    console.log("Tesseract OCR hasil:", text);  // Log hasil OCR

    // Mencari data dengan regex yang lebih tepat
    const nikMatch = text.match(/\b\d{16}\b/);
    const nameMatch = text.match(/Nama\s*[:\s]*(.*?)(?:\n|$)/i);  // Memperbaiki regex untuk nama
    const dobMatch = text.match(/Tempat\/Tgi Lahir\s*[:\s]*(.*?)(?:\n|$)/i);  // Memperbaiki regex untuk tanggal lahir
    const addressMatch = text.match(/Alamat\s*[:\s]*(.*?)(?:\n|$)/i);  // Memperbaiki regex untuk alamat

    if (!nikMatch || !nameMatch || !dobMatch || !addressMatch) {
      return res.status(400).json({ error: "❌ Failed to extract valid data from KTP." });
    }

    const result = {
      full_name: nameMatch[1]?.trim() || "",
      nik_number: nikMatch[0] || "",
      date_of_birth: dobMatch[1]?.trim() || "",
      address: addressMatch[1]?.trim() || "",
      raw_text: text,
      file_url: `${PUBLIC_KYC_URL}/${file.filename}`,
    };

    console.log("Data yang dikirim ke frontend:", result);  // Pastikan data ini ada di backend

    return res.json({ success: true, data: result });  // Kirim hasil OCR ke frontend
  } catch (err) {
    console.error("❌ OCR error:", err);
    return res.status(500).json({ error: "OCR processing failed" });
  }
};


// Helper function for validating KYC data
const validateKycData = (data) => {
  const { full_name, nik_number } = data;
  if (!full_name || !nik_number) {
    throw new Error("❌ Full name and NIK are required.");
  }
};

const submitKycHandler = async (req, res, fileUrl) => {
  try {
    // Ambil SEMUA field dari req.body
    const {
      full_name, nik_number, date_of_birth, address,
      phone_number, wallet_address,
      bank_account_number, bank_name, account_holder_name
    } = req.body;

    // Validasi minimal (optional)
    if (!full_name || !nik_number) {
      return res.status(400).json({ error: "Full name dan NIK wajib diisi." });
    }

    // 1. Upsert ke UserKycRequest
    await UserKycRequest.upsert({
      userId: req.user.id,
      fullName: full_name,
      nikNumber: nik_number,
      dateOfBirth: date_of_birth || null,
      address,
      phoneNumber: phone_number || null,
      walletAddress: wallet_address || null,
      bankAccountNumber: bank_account_number || null,
      bankName: bank_name || null,
      accountHolderName: account_holder_name || null,
      idCardImageUrl: fileUrl || null,
      status: "APPROVED",
      reasonRejected: null,
      submittedAt: new Date(),
    });

    // 2. Otomatis update ke User (wallet dan bankAccountNumber)
    const updateUser = {};
    if (wallet_address) updateUser.wallet = wallet_address;
    if (bank_account_number) updateUser.bankAccountNumber = bank_account_number;

    if (Object.keys(updateUser).length > 0) {
      await User.update(updateUser, { where: { id: req.user.id } });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("❌ Submit KYC error:", err);
    return res.status(500).json({ error: "Internal server error during submission." });
  }
};




// Get KYC status handler
const getKycStatusHandler = async (req, res) => {
  try {
    // Ambil data KYC terbaru untuk user yang sedang login
    const request = await UserKycRequest.findOne({
      where: { userId: req.user.id },
      order: [["submitted_at", "DESC"]], // Ambil KYC yang terbaru
    });

    // Jika tidak ada data KYC, kembalikan status "NONE"
    if (!request) return res.json({ status: "NONE" });

    // Kembalikan status dan data KYC
    return res.json({
      status: request.status,
      data: {
        full_name: request.fullName,
        nik_number: request.nikNumber,
        date_of_birth: request.dateOfBirth,
        address: request.address,
        phone_number: request.phoneNumber,
        wallet_address: request.walletAddress,
        bank_account_number: request.bankAccountNumber,
        bank_name: request.bankName, // Nama bank
        account_holder_name: request.accountHolderName, // Nama pemilik rekening
      },
    });
  } catch (err) {
    console.error("❌ Get KYC status error:", err);
    return res.status(500).json({ error: "Internal server error fetching status." });
  }
};


// Update KYC data handler
// Helper function for updating KYC
const updateUserKyc = async (userId, updatePayload) => {
  const kyc = await UserKycRequest.findOne({
    where: { userId },
    order: [["submitted_at", "DESC"]],
  });

  if (!kyc) {
    throw new Error("No editable KYC found.");
  }

  await kyc.update(updatePayload);
  return kyc;
};

const updateKycHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const kyc = await UserKycRequest.findOne({
      where: { userId },
      order: [["submitted_at", "DESC"]],
    });
    if (!kyc) return res.status(404).json({ error: "No KYC data found" });

    const updatePayload = {};
    const allowedFields = [
      { body: "full_name", model: "fullName" },
      { body: "nik_number", model: "nikNumber" },
      { body: "date_of_birth", model: "dateOfBirth" },
      { body: "address", model: "address" },
      { body: "phone_number", model: "phoneNumber" },
      { body: "wallet_address", model: "walletAddress" },
      { body: "bank_account_number", model: "bankAccountNumber" },
      { body: "bank_name", model: "bankName" },
      { body: "account_holder_name", model: "accountHolderName" },
    ];
    allowedFields.forEach(({ body, model }) => {
      if (req.body[body] !== undefined) {
        updatePayload[model] = req.body[body];
      }
    });
    if (req.file) {
      if (!req.file.mimetype.startsWith("image/")) {
        return res.status(400).json({ error: "❌ Only image files are allowed." });
      }
      updatePayload.idCardImageUrl = `${req.protocol}://${req.get('host')}/public/kyc/${req.file.filename}`;
    }
    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({ error: "No update data provided." });
    }

    await kyc.update(updatePayload);

    // Sync ke User utama
    const userUpdateFields = {};
    if (req.body.wallet_address !== undefined) userUpdateFields.wallet = req.body.wallet_address;
    if (req.body.bank_account_number !== undefined) userUpdateFields.bankAccountNumber = req.body.bank_account_number;

    if (Object.keys(userUpdateFields).length > 0) {
      await User.update(userUpdateFields, { where: { id: userId } });
    }

    return res.json({ success: true, message: "✅ KYC updated successfully." });
  } catch (err) {
    console.error("❌ KYC update error:", err);
    return res.status(500).json({ error: "Failed to update KYC" });
  }
};



// Helper function to validate uploaded files
const validateUploadedFiles = (files) => {
  if (!files?.id_card_image) {
    return { error: "ID card image is required." };
  }
  return { idCardImage: files.id_card_image[0] };
};

module.exports = {
  ocrKtpHandler,
  submitKycHandler,
  getKycStatusHandler,
  updateKycHandler,
};

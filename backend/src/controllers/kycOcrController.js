const path = require("path");
const { createWorker } = require("tesseract.js");

/**
 * Fungsi untuk ekstrak data dari hasil teks OCR KTP
 * @param {string} text
 * @returns {object}
 */
function parseKtpText(text) {
  const cleaned = text.replace(/\s+/g, " ").trim();

  const nikMatch = cleaned.match(/\b\d{16}\b/);
  const nameMatch = cleaned.match(/nama\s*[:\-]?\s*([A-Z\s]+)/i);
  const ttlMatch = cleaned.match(/(?:ttl|tempat[\s\/]?tgl[\s\/]?lahir)[:\-]?\s*(.+?),\s*(\d{2}[-\/]\d{2}[-\/]\d{4})/i);
  const addressMatch = cleaned.match(/alamat\s*[:\-]?\s*(.+?)(?=(rt|rw|kel|desa|kec|kab|kota|prov|agama|status))/i);

  return {
    nik_number: nikMatch ? nikMatch[0] : "",
    full_name: nameMatch ? nameMatch[1].trim() : "",
    date_of_birth: ttlMatch ? new Date(ttlMatch[2].replace(/[-\/]/g, "-")) : "",
    address: addressMatch ? addressMatch[1].trim() : "",
    raw_text: text,
  };
}

const ocrKtpHandler = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "❌ No image uploaded." });

    const imagePath = path.join(__dirname, "../../public/kyc", file.filename);

    const worker = await createWorker("eng", 1, {
      logger: m => console.log("🧠 OCR Progress:", m), // optional
    });

    await worker.loadLanguage("ind");
    await worker.initialize("ind");

    const { data } = await worker.recognize(imagePath);
    await worker.terminate();

    const parsed = parseKtpText(data.text);

    parsed.file_url = ``;

    return res.json({ data: parsed });
  } catch (err) {
    console.error("❌ OCR error:", err);
    return res.status(500).json({ error: "Internal server error during OCR." });
  }
};

module.exports = {
  ocrKtpHandler,
};

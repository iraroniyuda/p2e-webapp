const express = require("express");
const router = express.Router();
const axios = require("axios");

// 🔒 Batasi hanya domain OttoPay
router.get("/proxy-ottopay", async (req, res) => {
    console.log("✅ /proxy-ottopay endpoint hit with:", url);

  const url = req.query.url;
  const isOtto = url?.startsWith("https://secure.ottopay.id");
  const isMpstore = url?.startsWith("https://secure-paymentlink.mpstore.co.id");

  if (!url || (!isOtto && !isMpstore)) {
    return res.status(400).send("Invalid or disallowed URL.");
  }

  try {
    const response = await axios.get(url);
    res.set("Content-Type", "text/html");
    res.send(response.data);
  } catch (err) {
    console.error("❌ Proxy OttoPay/Mpstore gagal:", err.message);
    res.status(500).send("Gagal ambil konten dari penyedia pembayaran.");
  }
});


module.exports = router;

// apps/backend-api/src/controllers/mpstorePaymentController.js
const axios = require('axios');
const { generateSignature } = require('../utils/mpstoreUtils');

const getMPStoreBalance = async (req, res) => {
  try {
    const timestamp = new Date().toISOString();
    const payload = "";
    const signature = generateSignature(payload, process.env.MPSTORE_PIN);

    const response = await axios.get(`${process.env.MPSTORE_HOST}/get-balance`, {
      headers: {
        "Content-Type": "application/json",
        "Timestamp": timestamp,
        "Signature": signature,
        "Authorization": `Basic ${Buffer.from(`${process.env.MPSTORE_USERNAME}:${process.env.MPSTORE_PASSWORD}`).toString('base64')}`
      }
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching MPStore balance:", error);
    res.status(500).json({ error: "Failed to fetch balance" });
  }
};



module.exports = { getMPStoreBalance };

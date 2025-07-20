const axios = require("axios");
const qs = require("qs");
const moment = require("moment-timezone");

/**
 * 📦 Minify JSON (tanpa spasi, newline)
 */
function minifyJSON(obj) {
  return JSON.stringify(obj);
}

/**
 * 🕒 Get formatted timestamp in Asia/Jakarta timezone
 * Output format: YYYY-MM-DDTHH:mm:ss+07:00
 */
function getTimestamp() {
  return moment().tz("Asia/Jakarta").format("YYYY-MM-DDTHH:mm:ssZ");
}

/**
 * 🔐 Build Basic Auth string in Base64 (sesuai format MPStore)
 * Accepts credential object: { id, username, password, pin }
 */
function buildAuthorizationBase64({ id, username, password, pin }) {
  const authString = `${id}:${username}:${password}:${pin}`;
  return Buffer.from(authString).toString("base64");
}

/**
 * 🔐 Generate Signature from MPStore Signature Calculator
 * 
 * @param {Object} params
 * @param {string} params.method - HTTP method (e.g. POST or GET)
 * @param {string} params.relativeUrl - Relative URL endpoint
 * @param {object} [params.requestBodyObj] - Payload object (POST only)
 * @param {string} params.timestamp - ISO timestamp (Asia/Jakarta)
 * @param {object} params.credentials - Object with { id, username, password, pin }
 * @returns {string} Signature
 */
async function generateSignature({ method, relativeUrl, requestBodyObj, timestamp, credentials }) {
  const authorization = buildAuthorizationBase64(credentials);

  // ✅ Untuk GET, requestBody harus string kosong
  const requestBody = method === "GET" ? "" : minifyJSON(requestBodyObj || {});

  const payload = qs.stringify({
    method,
    relativeUrl,
    authorization,
    requestBody,
    timestamp,
  });

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "Timestamp": timestamp,
    "IdReseller": credentials.id,
  };

  console.log(`[${timestamp}] 🔐 Generating Signature`);
  console.log(payload);
  console.log("Headers:", headers);

  try {
    const response = await axios.post(
      "https://api.mpx.co.id/api/serviceh2h/dev/signature-calculator",
      payload,
      { headers }
    );

    const signature = response.data?.values?.message?.result;

    if (!signature) {
      console.error("❌ Signature response missing:", response.data);
      throw new Error("No signature returned");
    }

    return signature;
  } catch (error) {
    console.error("❌ Error generating signature:", error?.response?.data || error.message);
    throw new Error("Failed to generate signature");
  }
}

module.exports = {
  generateSignature,
  buildAuthorizationBase64,
  minifyJSON,
  getTimestamp
};

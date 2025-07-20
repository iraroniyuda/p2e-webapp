// apps/backend-api/src/utils/jwtUtils.js
const jwt = require('jsonwebtoken');
require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local'
});

// ✅ Fungsi untuk Generate JWT Token (Aman dan Stabil)
exports.generateToken = (user) => {
  console.log("🔑 Generating Token for User:", user.username);

  if (!user || !user.id) {
    throw new Error("Invalid user data for token generation");
  }

  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    issuer: "",
    audience: user.id.toString(),
  });

  console.log("✅ Token Generated:", token);
  return token;
};

// ✅ Fungsi untuk Memverifikasi JWT Token (Aman dan Stabil)
exports.verifyToken = (token) => {
  try {
    if (!token) {
      console.error("❌ Verification Error: No Token Provided");
      throw new Error("Access denied: No token provided");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: ""
    });

    console.log("✅ Token Verified:", decoded);
    return decoded;
  } catch (error) {
    console.error("❌ JWT Verification Error:", error.message);
    throw new Error("Invalid or expired token");
  }
};
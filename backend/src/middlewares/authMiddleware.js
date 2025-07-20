// apps/backend-api/src/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
require('dotenv').config();
const User = require('../models/User');
const { verifyToken: verifyJWT } = require('../utils/jwtUtils');

// ✅ Middleware Verifikasi JWT (Stabil & Debugging)
const verifyToken = async (req, res, next) => {
  try {
    console.log("🔎 Verifying Token...");

    // ✅ Cek Token dari Headers atau Cookies
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
      console.log("✅ Token from Header:", token);
    } else if (req.cookies && req.cookies.jwt_token) {
      token = req.cookies.jwt_token;
      console.log("✅ Token from Cookie:", token);
    }

    if (!token) {
      console.error("❌ Access Denied: No Token Provided");
      return res.status(401).json({ message: "Access denied: No token provided" });
    }

    // ✅ Verifikasi JWT Token
    const decoded = verifyJWT(token);
    console.log("✅ Token Decoded:", decoded);

    // ✅ Fetch User dari Database
    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "email", "username", "role", "isSuspended"],
    });


    if (!user) {
      console.error("❌ User Not Found for ID:", decoded.id);
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isSuspended) {
      console.warn("⛔ Suspended User Blocked:", user.username);
      return res.status(403).json({ message: "Akun Anda telah ditangguhkan." });
    }


    // ✅ Simpan User ke req.user
    req.user = user;
    console.log("✅ User Authenticated:", req.user);
    next();
  } catch (err) {
    console.error("❌ Invalid Token:", err.message);
    res.status(401).json({ message: "Invalid token" });
  }
};



// ✅ Middleware Role Authorization (Optimized)
const requireRole = (role) => {
  return (req, res, next) => {
    console.log("🔎 Checking Role:", req.user?.role);
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: No User Data" });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ message: "Forbidden: Insufficient Role" });
    }
    next();
  };
};

// ✅ Middleware Verifikasi Admin (Optimized)
const verifyAdmin = async (req, res, next) => {
  try {
    console.log("🔎 Verifying Admin Access...");

    if (!req.user) {
      return res.status(401).json({ message: "Access denied: No user data" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    console.log("✅ Admin Verified:", req.user.username);
    next();
  } catch (error) {
    console.error("❌ Error Verifying Admin:", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
};

// ✅ Export Middleware dengan Benar
module.exports = {
  verifyToken,
  requireRole,
  verifyAdmin
};
// apps/backend-api/src/middlewares/kycMiddleware.js
const UserKycRequest = require("../models/UserKycRequest");

// ✅ Middleware Verifikasi KYC Approved (Consistent Style)
const requireKycApproved = async (req, res, next) => {
  try {
    console.log("🔎 Verifying KYC Status...");

    if (!req.user) {
      console.error("❌ No User Data on Request");
      return res.status(401).json({ message: "Unauthorized: No user data" });
    }

    const userId = req.user.id;

    const kyc = await UserKycRequest.findOne({
      where: { user_id: userId },
      order: [["submitted_at", "DESC"]],
    });

    if (!kyc || kyc.status !== "APPROVED") {
      console.warn("❌ KYC Not Approved or Not Found");
      return res.status(403).json({ message: "KYC not approved. Access denied." });
    }

    console.log("✅ KYC Approved for User ID:", userId);
    next();
  } catch (err) {
    console.error("❌ KYC Middleware Error:", err.message);
    res.status(500).json({ message: "Internal server error (KYC check)" });
  }
};

// ✅ Export Middleware
module.exports = {
  requireKycApproved,
};

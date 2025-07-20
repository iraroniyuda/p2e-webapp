const express = require("express");
const router = express.Router();

const {
  requestChampionship,
  approveChampionshipRequest,
  registerToChampionship,
  approveOrRejectParticipant,
  getMyChampionships,
  getUpcomingChampionships,
  getPendingChampionshipRequests,
  getChampionshipParticipants,
  getAllChampionships
} = require("../controllers/championshipEnrollmentController");

const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

// ✅ Circuit Owner mengajukan championship
router.post("/request", verifyToken, requestChampionship);

// ✅ Admin menyetujui dan mengatur championship
router.post("/approve/:id", verifyToken, verifyAdmin, approveChampionshipRequest);

// ✅ User biasa daftar championship
router.post("/register", verifyToken, registerToChampionship);

// ✅ Circuit Owner menyetujui atau menolak peserta
router.post("/participant/:id", verifyToken, approveOrRejectParticipant);

router.get("/my", verifyToken, getMyChampionships);

// championshipEnrollmentRoutes.js
router.get("/upcoming", verifyToken, getUpcomingChampionships);

router.get("/pending", verifyToken, verifyAdmin, getPendingChampionshipRequests);

router.get("/participants/:championshipId", verifyToken, verifyAdmin, getChampionshipParticipants);


router.get("/all", verifyToken, verifyAdmin, getAllChampionships);

module.exports = router;

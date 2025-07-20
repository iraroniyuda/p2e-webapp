const express = require("express");
const router = express.Router();

const {
  assignPhaseGroups,
  getPromotionPoolForPhase,
  submitGroupResult,
  promoteTopParticipants,
  completeGrandFinalAndReward,
  getMatchGroups,
  createRoomForGroup,
  joinRoom,
  getRoomStatus,
  startGroupRace,
  getMyGroups,
  setUserReadyStatus,
  getMissingRoomUsers,
  resetRoom,
  getMyActiveGroup,
  getParticipantsByPhase,
  triggerOpenInUnity,
  getAllGroups,
  clearPendingCommand,
  getAllRooms,
  getAllMyGroups,
  completeGroup,
  getGrandFinalWinnersPreview
} = require("../controllers/championshipGameplayController");

const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

// ✅ Mulai fase & bagi grup (hanya oleh circuit owner)

router.get("/groups/all", verifyToken, verifyAdmin, getAllGroups);

router.get("/groups/all-my", verifyToken, getAllMyGroups);
router.get("/rooms/all", verifyToken, verifyAdmin, getAllRooms);
router.post("/championship/:championshipId/assign-groups", verifyToken, verifyAdmin, assignPhaseGroups);


// ✅ Admin membuat room untuk grup tertentu
router.post("/group/:groupId/create-room",  verifyToken, verifyAdmin, createRoomForGroup);

// ✅ Unity (user) join room
router.post("/group/:groupId/join-room", verifyToken, joinRoom);

// ✅ Admin/Unity lihat siapa yang sudah join
router.get("/group/:groupId/room-status", verifyToken, verifyAdmin, getRoomStatus);

// ✅ Admin trigger mulai race
router.post("/group/:groupId/start-race", verifyToken, startGroupRace);

router.patch("/group/:groupId/user/:userId/set-ready", verifyToken, setUserReadyStatus);

router.get("/group/:groupId/missing-users", verifyToken, verifyAdmin, getMissingRoomUsers);

router.post("/group/:groupId/reset-room", verifyToken, verifyAdmin, resetRoom);


// ✅ Simpan hasil race per grup (oleh penyelenggara atau backend otomatis)
router.post("/group/:groupId/submit-result", verifyToken, submitGroupResult);
router.get("/groups/my", verifyToken, getMyGroups);
router.get("/groups/:championshipId", verifyToken, getMatchGroups);

router.get("/group/active", verifyToken, getMyActiveGroup);


router.post("/group/:groupId/complete-group", verifyToken, verifyAdmin, completeGroup);



// ✅ Promosikan peserta ke fase selanjutnya
router.post("/championship/promote", verifyToken, verifyAdmin, promoteTopParticipants);


// ✅ Grand final selesai & distribusi hadiah
router.post("/championship/:id/complete", verifyToken, verifyAdmin, completeGrandFinalAndReward);

router.get(
  "/championship/:championshipId/promotion-pool",
  verifyToken, verifyAdmin,
  getPromotionPoolForPhase
);

router.get(
  "/championship/:id/grandfinal-winners-preview",
  verifyToken,
  verifyAdmin,
  getGrandFinalWinnersPreview
);

router.get("/championship/:championshipId/phase-participants", verifyToken, verifyAdmin, getParticipantsByPhase);

// routes/championshipGameplayRoutes.js
router.post("/group/:groupId/open-in-unity", verifyToken, verifyAdmin, triggerOpenInUnity);

router.post("/group/:groupId/reset-command", verifyToken, clearPendingCommand);


module.exports = router;

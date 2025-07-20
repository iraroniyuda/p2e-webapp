const express = require("express");
const router = express.Router();

const {
  listSchedules,
  getScheduleDetail,
  approveParticipants,
  distributeAirdrop,
  createSchedule,
  getAirdropSources,
  editSchedule,
  deleteSchedule,
} = require("../controllers/adminAirdropController");

const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

// Routes
router.get("/schedules", verifyToken, verifyAdmin, listSchedules);
router.get("/schedule/:id", verifyToken, verifyAdmin, getScheduleDetail);
router.post("/:id/approve", verifyToken, verifyAdmin, approveParticipants);
router.post("/:id/distribute", verifyToken, verifyAdmin, distributeAirdrop);
router.post("/create", verifyToken, verifyAdmin, createSchedule);
router.get("/sources", verifyToken, verifyAdmin, getAirdropSources);
router.post("/schedule/:id/edit", verifyToken, verifyAdmin, editSchedule);
router.post("/schedule/:id/delete", verifyToken, verifyAdmin, deleteSchedule);
module.exports = router;

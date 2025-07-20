const express = require("express");
const router = express.Router();
const {
  getUsersForCircuitOwnership,
  getCircuitOwners,
  assignCircuitOwner,
  unassignCircuitOwner,
} = require("../controllers/adminCircuitOwnerController");
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

// Ambil semua user non-admin untuk opsi assign
router.get("/users", verifyToken, verifyAdmin, getUsersForCircuitOwnership);

// Ambil semua circuit owner
router.get("/", verifyToken, verifyAdmin, getCircuitOwners);

// Assign user jadi circuit owner
router.post("/assign", verifyToken, verifyAdmin, assignCircuitOwner);

// Unassign user dari circuit owner
router.post("/unassign", verifyToken, verifyAdmin, unassignCircuitOwner);

module.exports = router;

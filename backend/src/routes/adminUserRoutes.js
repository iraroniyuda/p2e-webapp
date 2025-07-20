const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");
const { getAllUsers, toggleSuspendUser } = require("../controllers/adminUserController");

router.use(verifyToken, verifyAdmin);

router.get("/users", getAllUsers);
router.post("/users/:id/toggle-suspend", toggleSuspendUser);

module.exports = router;

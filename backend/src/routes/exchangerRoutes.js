// src/routes/exchangerRoutes.js
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const { getAllAvailableExchangers } = require("../controllers/exchangerController");

router.get("/list-available", verifyToken, getAllAvailableExchangers); 
module.exports = router;

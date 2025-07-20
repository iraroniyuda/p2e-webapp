const express = require('express');
const router = express.Router();
const { handleMPStoreCallback } = require('../controllers/mpstoreCallbackController');

// No auth middleware – karena ini dipanggil dari MPStore secara server-to-server
router.post('/callback/mpstore', handleMPStoreCallback);

module.exports = router;

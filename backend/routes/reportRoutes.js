const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');

// Fetch report stats (Read-only, no audit need)
router.get('/summary', auth, reportController.getSummary);

module.exports = router;

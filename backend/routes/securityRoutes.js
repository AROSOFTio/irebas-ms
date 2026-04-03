const express = require('express');
const router = express.Router();
const securityController = require('../controllers/securityController');
const auth = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');
const checkRole = require('../middleware/checkRole');

router.get('/events', auth, securityController.getEvents);
router.get('/alerts', auth, securityController.getAlerts);
// Admin and Security Analyst can simulate threats
router.post('/simulate', auth, checkRole(['Admin', 'Security Analyst']), auditLogger, securityController.simulateEvent);

module.exports = router;

const express = require('express');
const router = express.Router();
const securityController = require('../controllers/securityController');
const auth = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');
const checkRole = require('../middleware/checkRole');

// Role Lists
const topManagement = ['General Manager', 'Manager', 'System Security Analyst'];
const itStaff      = ['General Manager', 'IT Officer'];
const allStaff     = ['General Manager', 'Manager', 'System Security Analyst', 'Front Desk', 'IT Officer'];

// Get events (only Top Management + IT Officer)
router.get('/events', auth, checkRole([...topManagement, 'IT Officer']), securityController.getEvents);

// Get alerts (All Staff need to see active alerts)
router.get('/alerts', auth, checkRole(allStaff), securityController.getAlerts);

// Simulate threats (Top Management Only)
router.post('/simulate', auth, checkRole(topManagement), auditLogger, securityController.simulateEvent);

module.exports = router;

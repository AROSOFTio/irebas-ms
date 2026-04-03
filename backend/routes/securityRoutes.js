const express = require('express');
const router = express.Router();
const securityController = require('../controllers/securityController');
const auth = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');

router.get('/events', auth, securityController.getEvents);
router.get('/alerts', auth, securityController.getAlerts);
router.post('/simulate', auth, auditLogger, securityController.simulateEvent);

module.exports = router;

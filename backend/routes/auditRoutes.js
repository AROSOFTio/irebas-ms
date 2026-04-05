const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Audit logs ONLY for General Manager and System Security Analyst
router.get('/', auth, checkRole(['General Manager', 'System Security Analyst']), auditController.getAuditLogs);

module.exports = router;

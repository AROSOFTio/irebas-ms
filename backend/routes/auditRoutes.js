const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Admin and Manager only
router.get('/', auth, checkRole(['Admin', 'Manager']), auditController.getAuditLogs);

module.exports = router;

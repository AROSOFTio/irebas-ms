const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Role-Based Summary Access
const topManagement = ['General Manager', 'Manager', 'System Security Analyst'];

router.get('/summary', auth, checkRole(topManagement), reportController.getSummary);

module.exports = router;

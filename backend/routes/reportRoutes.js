const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Admin and Manager only
router.get('/summary', auth, checkRole(['General Manager', 'Manager', 'System Security']), reportController.getSummary);

module.exports = router;

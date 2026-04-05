const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const auth = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');
const checkRole = require('../middleware/checkRole');

// Role Lists
const canView = ['General Manager', 'Manager', 'System Security Analyst'];
const canCreate = ['General Manager', 'Manager'];

// View customers (Managers + SSA)
router.get('/', auth, checkRole(canView), customerController.getCustomers);

// Create customer (ONLY GM and Manager)
router.post('/', auth, checkRole(canCreate), auditLogger, customerController.createCustomer);

// Profile
router.get('/me', auth, checkRole(['Customer']), customerController.getCustomerProfile);

module.exports = router;

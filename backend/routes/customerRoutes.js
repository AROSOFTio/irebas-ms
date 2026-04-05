const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const auth = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');
const checkRole = require('../middleware/checkRole');

// Get all customers (Managers only)
router.get('/', auth, checkRole(['General Manager', 'Manager', 'System Security']), customerController.getCustomers);

// Create customer (Managers only)
router.post('/', auth, checkRole(['General Manager', 'Manager']), auditLogger, customerController.createCustomer);

// Get my profile (Customer only)
router.get('/me', auth, checkRole(['Customer']), customerController.getCustomerProfile);

module.exports = router;

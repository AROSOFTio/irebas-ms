const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Fetch all transactions for monitoring
router.get('/', auth, checkRole(['General Manager', 'Manager', 'System Security']), transactionController.getTransactions);

// Fetch logged in customer's personal transactions
router.get('/me', auth, checkRole(['Customer']), transactionController.getCustomerTransactions);

// Perform a real transaction
router.post('/perform', auth, checkRole(['Customer']), transactionController.performTransaction);

module.exports = router;

const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Fetch all transactions
router.get('/', auth, transactionController.getTransactions);

// Simulate a transaction
router.post('/simulate', auth, transactionController.simulateTransaction);

module.exports = router;

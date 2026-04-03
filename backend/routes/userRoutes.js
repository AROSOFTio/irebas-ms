const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');
const checkRole = require('../middleware/checkRole');

// Admin only
router.get('/', auth, checkRole(['Admin']), userController.getUsers);
router.post('/', auth, checkRole(['Admin']), auditLogger, userController.createUser);

module.exports = router;

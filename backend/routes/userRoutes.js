const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');
const checkRole = require('../middleware/checkRole');

// General Manager & Manager
router.get('/', auth, checkRole(['General Manager', 'Manager']), userController.getUsers);
router.post('/', auth, checkRole(['General Manager', 'Manager']), auditLogger, userController.createUser);

module.exports = router;

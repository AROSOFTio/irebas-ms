const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');
const checkRole = require('../middleware/checkRole');

// Only General Manager and Manager can see/create staff
const topManagement = ['General Manager', 'Manager'];

router.get('/', auth, checkRole(topManagement), userController.getUsers);
router.post('/', auth, checkRole(topManagement), auditLogger, userController.createUser);

module.exports = router;

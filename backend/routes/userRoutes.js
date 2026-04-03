const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');

router.get('/', auth, userController.getUsers);
// Only creating users gets audited
router.post('/', auth, auditLogger, userController.createUser); 

module.exports = router;

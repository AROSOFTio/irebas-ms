const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');
const auth = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');

router.get('/', auth, incidentController.getIncidents);
router.post('/', auth, auditLogger, incidentController.createIncident);
router.put('/:id', auth, auditLogger, incidentController.updateIncident);

module.exports = router;

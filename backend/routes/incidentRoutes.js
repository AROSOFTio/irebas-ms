const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');
const auth = require('../middleware/auth');

router.get('/', auth, incidentController.getIncidents);
router.post('/', auth, incidentController.createIncident);
router.put('/:id', auth, incidentController.updateIncident);
router.post('/simulate', auth, incidentController.simulateIncident);

module.exports = router;

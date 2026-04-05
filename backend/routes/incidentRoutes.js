const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Role-Based Incident Handling
const topManagement = ['General Manager', 'Manager', 'System Security Analyst'];
const onlySSA = ['System Security Analyst'];

// View incidents (SSA + Top Management)
router.get('/', auth, checkRole(topManagement), incidentController.getIncidents);

// Create incident from alert (SSA + Top Management)
router.post('/', auth, checkRole(topManagement), incidentController.createIncident);

// RESOLVE incident (ONLY System Security Analyst)
router.put('/:id', auth, checkRole(onlySSA), incidentController.updateIncident);

// Simulate incident (SSA + Top Management)
router.post('/simulate', auth, checkRole(topManagement), incidentController.simulateIncident);

module.exports = router;

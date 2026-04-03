const pool = require('../db');

exports.getSummary = async (req, res) => {
    try {
        // Query 1: Event Counts by Threat Type
        const [threatTypes] = await pool.query(
            `SELECT event_type as name, COUNT(*) as value 
             FROM security_events 
             GROUP BY event_type 
             ORDER BY value DESC 
             LIMIT 5`
        );

        // Query 2: Alerts by Severity
        const [alertSeverity] = await pool.query(
            `SELECT severity as name, COUNT(*) as value 
             FROM alerts 
             GROUP BY severity`
        );

        // Query 3: Incident Resolution Rate
        const [[{ total_incidents, resolved_incidents }]] = await pool.query(
            `SELECT 
                COUNT(*) as total_incidents, 
                SUM(CASE WHEN status IN ('RESOLVED', 'CLOSED') THEN 1 ELSE 0 END) as resolved_incidents 
             FROM incidents`
        );

        res.json({
            threatTypes,
            alertSeverity,
            incidentStats: {
                total: total_incidents || 0,
                resolved: resolved_incidents || 0,
                resolutionRate: total_incidents > 0 ? ((resolved_incidents / total_incidents) * 100).toFixed(1) : 0
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
};

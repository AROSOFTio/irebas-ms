const pool = require('../db');

exports.getStats = async (req, res) => {
    try {
        const [[{ total_alerts }]] = await pool.query(`SELECT COUNT(*) as total_alerts FROM alerts`);
        const [[{ critical_alerts }]] = await pool.query(`SELECT COUNT(*) as critical_alerts FROM alerts WHERE severity = 'CRITICAL'`);
        const [[{ failed_logins }]] = await pool.query(`SELECT COUNT(*) as failed_logins FROM security_events WHERE event_type = 'FAILED_LOGIN'`);
        const [[{ resolved_incidents }]] = await pool.query(`SELECT COUNT(*) as resolved_incidents FROM incidents WHERE status = 'RESOLVED' OR status = 'CLOSED'`);

        const chartData = [
            { name: 'Mon', alerts: 12, incidents: 2 },
            { name: 'Tue', alerts: 19, incidents: 4 },
            { name: 'Wed', alerts: 5, incidents: 1 },
            { name: 'Thu', alerts: Math.floor(Math.random() * 20), incidents: 3 },
            { name: 'Fri', alerts: 22, incidents: 6 },
            { name: 'Sat', alerts: 7, incidents: 0 },
            { name: 'Sun', alerts: 4, incidents: 0 },
        ];

        const [recent_alerts] = await pool.query(`SELECT id, title, severity, status, created_at FROM alerts ORDER BY created_at DESC LIMIT 5`);

        res.json({
            stats: {
                totalAlarms: total_alerts,
                criticalAlerts: critical_alerts,
                failedLogins: failed_logins,
                resolvedIncidents: resolved_incidents
            },
            chartData,
            recentAlerts: recent_alerts
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

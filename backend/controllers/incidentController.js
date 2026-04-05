const pool = require('../db');

const THREAT_TEMPLATES = [
    { title: 'Brute Force Attack Detected', description: 'Multiple failed login attempts from a single IP.', severity: 'CRITICAL', event_type: 'FAILED_LOGIN' },
    { title: 'Suspicious Large Withdrawal', description: 'A withdrawal exceeding UGX 10,000,000 was initiated.', severity: 'HIGH', event_type: 'LARGE_WITHDRAWAL' },
    { title: 'Unauthorized API Access Attempt', description: 'Access attempted on a protected endpoint without valid credentials.', severity: 'HIGH', event_type: 'UNAUTHORIZED_ACCESS' },
    { title: 'After-Hours Login Detected', description: 'Staff login recorded outside of business hours (10pm–5am).', severity: 'MEDIUM', event_type: 'AFTER_HOURS_LOGIN' },
    { title: 'Unusual Transfer Pattern', description: 'Multiple rapid transfers to different accounts detected.', severity: 'HIGH', event_type: 'SUSPICIOUS_TRANSFER' },
    { title: 'New Admin Account Created', description: 'A new staff account with elevated privileges was created.', severity: 'MEDIUM', event_type: 'PRIVILEGE_ESCALATION' },
    { title: 'SQL Injection Attempt Blocked', description: 'Malicious SQL payload detected and blocked in login form.', severity: 'CRITICAL', event_type: 'SQL_INJECTION' },
    { title: 'Password Policy Violation', description: 'A weak password was detected during account creation.', severity: 'LOW', event_type: 'POLICY_VIOLATION' },
];

exports.getIncidents = async (req, res) => {
    try {
        const [incidents] = await pool.query(
            `SELECT i.*, a.title, a.severity, a.description, u.username as assigned_user 
             FROM incidents i 
             JOIN alerts a ON i.alert_id = a.id 
             LEFT JOIN users u ON i.assigned_to = u.id 
             ORDER BY i.created_at DESC`
        );
        res.json(incidents);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.createIncident = async (req, res) => {
    const { alert_id } = req.body;
    try {
        const [incident] = await pool.query(
            `INSERT INTO incidents (alert_id, assigned_to, status) VALUES (?, ?, 'OPEN')`,
            [alert_id, req.user.id]
        );
        await pool.query(`UPDATE alerts SET status = 'ASSIGNED' WHERE id = ?`, [alert_id]);
        res.json({ message: 'Incident created', incident_id: incident.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.updateIncident = async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;
    try {
        await pool.query(
            `UPDATE incidents SET status = ?, notes = ? WHERE id = ?`,
            [status, notes, id]
        );
        if (status === 'RESOLVED' || status === 'CLOSED') {
            const [rows] = await pool.query(`SELECT alert_id FROM incidents WHERE id = ?`, [id]);
            if (rows.length > 0) {
                await pool.query(`UPDATE alerts SET status = ? WHERE id = ?`, [status, rows[0].alert_id]);
            }
        }

        // Audit log
        await pool.query(
            `INSERT INTO audit_logs (action, module, details, user_id, ip_address) VALUES (?, ?, ?, ?, ?)`,
            ['UPDATE_INCIDENT', 'Incidents', `Incident #${id} updated to ${status}`, req.user.id, req.ip || '0.0.0.0']
        ).catch(() => {});

        res.json({ message: 'Incident updated' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.simulateIncident = async (req, res) => {
    try {
        // Pick a random threat template
        const template = THREAT_TEMPLATES[Math.floor(Math.random() * THREAT_TEMPLATES.length)];

        // 1. Create a security event
        const fakeIp = `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
        await pool.query(
            `INSERT INTO security_events (event_type, description, ip_address) VALUES (?, ?, ?)`,
            [template.event_type, template.description, fakeIp]
        );

        // 2. Create an alert
        const [alertResult] = await pool.query(
            `INSERT INTO alerts (title, description, severity, status) VALUES (?, ?, ?, 'NEW')`,
            [template.title, template.description, template.severity]
        );
        const alertId = alertResult.insertId;

        // 3. Create an incident linked to the alert
        await pool.query(
            `INSERT INTO incidents (alert_id, status) VALUES (?, 'OPEN')`,
            [alertId]
        );

        // 4. Audit log
        await pool.query(
            `INSERT INTO audit_logs (action, module, details, user_id, ip_address) VALUES (?, ?, ?, ?, ?)`,
            ['SIMULATE_INCIDENT', 'Security', `Simulated: ${template.title} [${template.severity}]`, req.user?.id || null, req.ip || '0.0.0.0']
        ).catch(() => {});

        // 5. Fire real-time socket alert to all connected clients
        if (req.io) {
            req.io.emit('new_alert', {
                id: alertId,
                title: template.title,
                description: template.description,
                severity: template.severity,
                status: 'NEW',
                created_at: new Date(),
            });
        }

        res.status(201).json({
            message: 'Incident simulated successfully',
            alert: { id: alertId, title: template.title, severity: template.severity }
        });
    } catch (error) {
        console.error('Simulate error:', error);
        res.status(500).json({ error: error.message });
    }
};

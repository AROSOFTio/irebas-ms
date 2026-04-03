const pool = require('../db');

exports.getEvents = async (req, res) => {
    try {
        const [events] = await pool.query(
            `SELECT e.*, u.username as user_name 
             FROM security_events e 
             LEFT JOIN users u ON e.user_id = u.id 
             ORDER BY e.created_at DESC LIMIT 100`
        );
        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.getAlerts = async (req, res) => {
    try {
        const [alerts] = await pool.query(
            `SELECT * FROM alerts ORDER BY created_at DESC LIMIT 100`
        );
        res.json(alerts);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.simulateEvent = async (req, res) => {
    try {
        // Randomly pick a threat scenario
        const scenarios = [
            { type: 'BRUTE_FORCE', desc: 'Multiple failed logins detected from offshore IP.', sev: 'HIGH' },
            { type: 'UNAUTHORIZED_ACCESS', desc: 'Attempt to access restricted vault subsystem.', sev: 'CRITICAL' },
            { type: 'SQL_INJECTION', desc: 'Suspicious payload intercepted at auth gateway.', sev: 'HIGH' },
            { type: 'LARGE_TRANSFER', desc: 'Anomalous $1M outbound wire flagged.', sev: 'MEDIUM' },
            { type: 'UNKNOWN_DEVICE', desc: 'Login from unrecognized machine.', sev: 'LOW' }
        ];
        
        const threat = scenarios[Math.floor(Math.random() * scenarios.length)];
        const mockIp = `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.1`;

        // 1. Insert Event
        const [eventResult] = await pool.query(
            `INSERT INTO security_events (event_type, description, ip_address) VALUES (?, ?, ?)`,
            [threat.type, threat.desc, mockIp]
        );

        // 2. Promotion to Alert (if Medium or higher)
        let alertResult = null;
        if (['MEDIUM', 'HIGH', 'CRITICAL'].includes(threat.sev)) {
            const [al] = await pool.query(
                `INSERT INTO alerts (title, description, severity, status) VALUES (?, ?, ?, 'NEW')`,
                [threat.type, threat.desc, threat.sev]
            );
            alertResult = al;
            
            // 3. Emit via Socket.io
            if (req.io) {
                req.io.emit('new_alert', {
                    id: al.insertId,
                    title: threat.type,
                    description: threat.desc,
                    severity: threat.sev,
                    created_at: new Date()
                });
            }
        }

        res.json({ message: "Simulated successfully", event_id: eventResult.insertId, alert_id: alertResult ? alertResult.insertId : null });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

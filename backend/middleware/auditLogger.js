const pool = require('../db');

const auditLogger = async (req, res, next) => {
    // Only log if the action modifies data (POST, PUT, DELETE)
    if (['POST', 'PUT', 'DELETE'].includes(req.method) && req.user) {
        
        let action = `${req.method} ${req.originalUrl}`;
        // Map common routes to readable actions
        if (req.originalUrl.includes('/simulate')) action = 'Simulated a Security Threat';
        if (req.originalUrl.includes('/incidents') && req.method === 'POST') action = 'Claimed an Alert / Created Incident';
        if (req.originalUrl.includes('/incidents') && req.method === 'PUT') action = 'Updated/Resolved an Incident Status';
        if (req.originalUrl.includes('/users') && req.method === 'POST') action = 'Provisioned a new Staff Account';

        try {
            await pool.query(
                `INSERT INTO audit_logs (user_id, action, ip_address) VALUES (?, ?, ?)`,
                [req.user.id, action, req.ip]
            );
        } catch (error) {
            console.error("Audit log failed:", error);
        }
    }
    next();
};

module.exports = auditLogger;

const pool = require('../db');

exports.getAuditLogs = async (req, res) => {
    try {
        const [logs] = await pool.query(
            `SELECT a.id, u.username, u.first_name, u.last_name, a.action, a.module, a.details, a.ip_address, a.created_at 
             FROM audit_logs a 
             LEFT JOIN users u ON a.user_id = u.id 
             ORDER BY a.created_at DESC LIMIT 200`
        );
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

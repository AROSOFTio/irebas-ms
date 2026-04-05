const pool = require('../db');

const auditLogger = async (req, res, next) => {
    if (['POST', 'PUT', 'DELETE'].includes(req.method) && req.user) {
        let action = 'SYSTEM_ACTION';
        let module = 'System';
        let details = `${req.method} ${req.originalUrl}`;

        const url = req.originalUrl;

        if (url.includes('/incidents/simulate'))                   { action = 'SIMULATE_INCIDENT';  module = 'Security';      details = 'Security threat incident simulated'; }
        else if (url.includes('/incidents') && req.method === 'POST')  { action = 'CREATE_INCIDENT';   module = 'Incidents';    details = 'Alert claimed and incident created'; }
        else if (url.includes('/incidents') && req.method === 'PUT')   { action = 'UPDATE_INCIDENT';   module = 'Incidents';    details = `Incident #${req.params.id} status updated`; }
        else if (url.includes('/users')     && req.method === 'POST')  { action = 'CREATE_STAFF';      module = 'Staff';        details = 'New staff member created'; }
        else if (url.includes('/customers') && req.method === 'POST')  { action = 'CREATE_CUSTOMER';   module = 'Customers';    details = 'New customer account opened'; }
        else if (url.includes('/alerts')    && req.method === 'PUT')   { action = 'UPDATE_ALERT';      module = 'Alerts';       details = `Alert #${req.params.id} updated`; }
        else if (url.includes('/transactions') && req.method === 'POST') { action = 'TRANSACTION';     module = 'Transactions'; details = 'Financial transaction performed'; }
        else if (url.includes('/settings')  && req.method === 'PUT')   { action = 'UPDATE_SETTINGS';   module = 'Settings';     details = 'System settings modified'; }

        try {
            await pool.query(
                `INSERT INTO audit_logs (user_id, action, module, details, ip_address) VALUES (?, ?, ?, ?, ?)`,
                [req.user.id, action, module, details, req.ip || '0.0.0.0']
            );
        } catch (err) {
            console.error('Audit log write failed:', err.message);
        }
    }
    next();
};

module.exports = auditLogger;

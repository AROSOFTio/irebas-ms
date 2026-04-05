const pool = require('../db');

exports.getSummary = async (req, res) => {
    try {
        // Security: Event Counts by Threat Type
        const [threatTypes] = await pool.query(
            `SELECT event_type as name, COUNT(*) as value 
             FROM security_events 
             GROUP BY event_type 
             ORDER BY value DESC 
             LIMIT 5`
        );

        // Security: Alerts by Severity
        const [alertSeverity] = await pool.query(
            `SELECT severity as name, COUNT(*) as value 
             FROM alerts 
             GROUP BY severity`
        );

        // Security: Incident Resolution Rate
        const [[{ total_incidents, resolved_incidents }]] = await pool.query(
            `SELECT 
                COUNT(*) as total_incidents, 
                SUM(CASE WHEN status IN ('RESOLVED', 'CLOSED') THEN 1 ELSE 0 END) as resolved_incidents 
             FROM incidents`
        );

        // Financial: Total balance in the bank
        const [[{ total_balance }]] = await pool.query(
            `SELECT COALESCE(SUM(balance), 0) as total_balance FROM customers`
        );

        // Financial: Total Active Accounts
        const [[{ total_accounts }]] = await pool.query(
            `SELECT COUNT(*) as total_accounts FROM customers`
        );

        // Financial: Transaction volume by type
        const [txByType] = await pool.query(
            `SELECT transaction_type as name, COUNT(*) as count, COALESCE(SUM(amount), 0) as total
             FROM transactions
             GROUP BY transaction_type`
        );

        // Financial: Daily transaction volume last 14 days
        const [txByDay] = await pool.query(
            `SELECT 
                DATE_FORMAT(created_at, '%d %b') as date,
                SUM(CASE WHEN transaction_type = 'DEPOSIT' THEN amount ELSE 0 END) as deposits,
                SUM(CASE WHEN transaction_type = 'WITHDRAWAL' THEN amount ELSE 0 END) as withdrawals
             FROM transactions
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
             GROUP BY DATE(created_at), DATE_FORMAT(created_at, '%d %b')
             ORDER BY DATE(created_at) ASC`
        );

        res.json({
            threatTypes,
            alertSeverity,
            incidentStats: {
                total: total_incidents || 0,
                resolved: resolved_incidents || 0,
                resolutionRate: total_incidents > 0 ? ((resolved_incidents / total_incidents) * 100).toFixed(1) : 0
            },
            financialStats: {
                totalBalance: parseFloat(total_balance),
                totalAccounts: total_accounts,
                txByType,
                txByDay,
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
};

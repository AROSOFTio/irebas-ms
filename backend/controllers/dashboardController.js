const pool = require('../db');

exports.getStats = async (req, res) => {
    try {
        // Security metrics
        const [[{ total_alerts }]] = await pool.query(`SELECT COUNT(*) as total_alerts FROM alerts`);
        const [[{ critical_alerts }]] = await pool.query(`SELECT COUNT(*) as critical_alerts FROM alerts WHERE severity = 'CRITICAL'`);
        const [[{ failed_logins }]] = await pool.query(`SELECT COUNT(*) as failed_logins FROM security_events WHERE event_type = 'FAILED_LOGIN'`);
        const [[{ resolved_incidents }]] = await pool.query(`SELECT COUNT(*) as resolved_incidents FROM incidents WHERE status = 'RESOLVED' OR status = 'CLOSED'`);

        // Financial / Banking metrics
        const [[{ total_balance }]] = await pool.query(`SELECT COALESCE(SUM(balance), 0) as total_balance FROM customers`);
        const [[{ active_customers }]] = await pool.query(`SELECT COUNT(*) as active_customers FROM customers`);
        const [[{ total_transactions }]] = await pool.query(`SELECT COUNT(*) as total_transactions FROM transactions`);
        const [[{ total_deposits }]] = await pool.query(`SELECT COALESCE(SUM(amount), 0) as total_deposits FROM transactions WHERE transaction_type = 'DEPOSIT'`);

        // Chart data from real transactions (last 7 days)
        const [txByDay] = await pool.query(`
            SELECT
                DATE_FORMAT(created_at, '%a') as name,
                SUM(CASE WHEN transaction_type = 'DEPOSIT' THEN 1 ELSE 0 END) as deposits,
                SUM(CASE WHEN transaction_type = 'WITHDRAWAL' THEN 1 ELSE 0 END) as withdrawals,
                SUM(CASE WHEN transaction_type = 'TRANSFER' THEN 1 ELSE 0 END) as transfers
            FROM transactions
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE(created_at), DATE_FORMAT(created_at, '%a')
            ORDER BY DATE(created_at) ASC
            LIMIT 7
        `);

        const [recent_alerts] = await pool.query(`SELECT id, title, severity, status, created_at FROM alerts ORDER BY created_at DESC LIMIT 5`);
        const [recent_transactions] = await pool.query(`
            SELECT t.*, c.first_name, c.last_name, c.account_number
            FROM transactions t
            JOIN customers c ON t.customer_id = c.id
            ORDER BY t.created_at DESC LIMIT 5
        `);

        res.json({
            stats: {
                totalAlarms: total_alerts,
                criticalAlerts: critical_alerts,
                failedLogins: failed_logins,
                resolvedIncidents: resolved_incidents,
                totalBalance: parseFloat(total_balance),
                activeCustomers: active_customers,
                totalTransactions: total_transactions,
                totalDeposits: parseFloat(total_deposits),
            },
            chartData: txByDay,
            recentAlerts: recent_alerts,
            recentTransactions: recent_transactions,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

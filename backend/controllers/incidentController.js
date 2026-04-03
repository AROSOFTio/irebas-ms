const pool = require('../db');

exports.getIncidents = async (req, res) => {
    try {
        const [incidents] = await pool.query(
            `SELECT i.*, a.title, a.severity, u.username as assigned_user 
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

        res.json({ message: "Incident created", incident_id: incident.insertId });
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
        res.json({ message: "Incident updated" });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

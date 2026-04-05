const pool = require('../db');
const bcrypt = require('bcryptjs');

exports.getUsers = async (req, res) => {
    try {
        const [users] = await pool.query(
            `SELECT u.id, u.username, u.first_name, u.last_name, u.designation, u.staff_id, r.name as role, u.created_at 
             FROM users u 
             JOIN roles r ON u.role_id = r.id 
             ORDER BY u.created_at DESC`
        );
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createUser = async (req, res) => {
    const { username, password, first_name, last_name, designation, staff_id, role_id } = req.body;
    try {
        if (req.user.role === 'Manager' && (role_id === 1 || role_id === 2)) {
            return res.status(403).json({ message: "Managers cannot provision General Manager or Manager roles" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            `INSERT INTO users (username, password_hash, first_name, last_name, designation, staff_id, role_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [username, hashedPassword, first_name, last_name, designation, staff_id, role_id || 3] // Default to System Security if missing
        );
        res.status(201).json({ message: "Staff member provisioned successfully" });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Username already exists" });
        }
        res.status(500).json({ error: error.message });
    }
};

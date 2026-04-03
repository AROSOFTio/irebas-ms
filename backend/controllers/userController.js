const pool = require('../db');
const bcrypt = require('bcryptjs');

exports.getUsers = async (req, res) => {
    try {
        const [users] = await pool.query(
            `SELECT u.id, u.username, r.name as role, u.created_at 
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
    const { username, password, role_id } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            `INSERT INTO users (username, password_hash, role_id) VALUES (?, ?, ?)`,
            [username, hashedPassword, role_id || 2] // Default to Analyst (role 2) if missing
        );
        res.status(201).json({ message: "Staff member provisioned successfully" });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Username already exists" });
        }
        res.status(500).json({ error: error.message });
    }
};

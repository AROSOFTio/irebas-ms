const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        // First check STAFF
        const [users] = await pool.query(
            `SELECT u.*, r.name as role_name 
             FROM users u 
             LEFT JOIN roles r ON u.role_id = r.id 
             WHERE u.username = ?`,
            [username]
        );

        if (users.length > 0) {
            const user = users[0];
            const isMatch = await bcrypt.compare(password, user.password_hash);

            if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

            const payload = { id: user.id, username: user.username, role: user.role_name };
            const token = jwt.sign(payload, process.env.JWT_SECRET || 'supersecretjwtkey', { expiresIn: '1d' });

            // Audit log
            await pool.query(
                `INSERT INTO audit_logs (action, module, details, user_id, ip_address) VALUES (?, ?, ?, ?, ?)`,
                ['LOGIN', 'Auth', 'User logged in', user.id, req.ip || '0.0.0.0']
            );

            return res.json({ token, user: payload });
        }

        // If not staff, check CUSTOMERS
        const [customers] = await pool.query(
            `SELECT c.* FROM customers c WHERE c.username = ?`, 
            [username]
        );

        if (customers.length > 0) {
            const customer = customers[0];
            const isMatch = await bcrypt.compare(password, customer.password_hash);
            
            if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

            const payload = { id: customer.id, username: customer.username, role: 'Customer' };
            const token = jwt.sign(payload, process.env.JWT_SECRET || 'supersecretjwtkey', { expiresIn: '1d' });

            return res.json({ token, user: payload });
        }

        return res.status(400).json({ message: 'Invalid credentials' });

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

exports.getMe = async (req, res) => {
    try {
        if (req.user.role === 'Customer') {
             const [customers] = await pool.query(
                `SELECT id, username, first_name, last_name, account_number, balance, 'Customer' as role_name 
                 FROM customers WHERE id = ?`,
                [req.user.id]
            );
            if (customers.length === 0) return res.status(404).json({ message: 'User not found' });
            return res.json(customers[0]);
        }

        // Staff
        const [users] = await pool.query(
            `SELECT u.id, u.username, u.first_name, u.last_name, u.designation, r.name as role_name 
             FROM users u 
             LEFT JOIN roles r ON u.role_id = r.id 
             WHERE u.id = ?`,
            [req.user.id]
        );

        if (users.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(users[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

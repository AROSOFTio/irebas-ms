const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { username, password } = req.body;
    const ip = req.ip || req.connection?.remoteAddress || '0.0.0.0';

    try {
        // 1. Check STAFF first
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
            if (!isMatch) {
                // Log failed login
                await pool.query(
                    `INSERT INTO audit_logs (action, module, details, user_id, ip_address) VALUES (?, ?, ?, ?, ?)`,
                    ['FAILED_LOGIN', 'Auth', `Failed login attempt for staff: ${username}`, user.id, ip]
                ).catch(() => {}); // non-blocking
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            const payload = {
                id: user.id,
                username: user.username,
                role: user.role_name,
                first_name: user.first_name,
                last_name: user.last_name,
                designation: user.designation,
                staff_id: user.staff_id,
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET || 'supersecretjwtkey', { expiresIn: '1d' });

            // Log successful login (non-blocking, won't crash if fails)
            await pool.query(
                `INSERT INTO audit_logs (action, module, details, user_id, ip_address) VALUES (?, ?, ?, ?, ?)`,
                ['LOGIN', 'Auth', `${user.first_name} ${user.last_name} logged in as ${user.role_name}`, user.id, ip]
            ).catch(() => {});

            return res.json({ token, user: payload });
        }

        // 2. Check CUSTOMERS
        const [customers] = await pool.query(
            `SELECT c.* FROM customers c WHERE c.username = ?`,
            [username]
        );

        if (customers.length > 0) {
            const customer = customers[0];
            const isMatch = await bcrypt.compare(password, customer.password_hash);
            if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

            const payload = {
                id: customer.id,
                username: customer.username,
                role: 'Customer',
                first_name: customer.first_name,
                last_name: customer.last_name,
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET || 'supersecretjwtkey', { expiresIn: '1d' });

            // Log customer login — no user_id FK constraint since customers are separate
            await pool.query(
                `INSERT INTO audit_logs (action, module, details, user_id, ip_address) VALUES (?, ?, ?, ?, ?)`,
                ['CUSTOMER_LOGIN', 'Auth', `Customer ${customer.first_name} ${customer.last_name} (Acct: ${customer.account_number}) logged in`, null, ip]
            ).catch(() => {});

            return res.json({ token, user: payload });
        }

        return res.status(400).json({ message: 'Invalid credentials' });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Server error');
    }
};

exports.getMe = async (req, res) => {
    try {
        if (req.user.role === 'Customer') {
            const [customers] = await pool.query(
                `SELECT id, username, first_name, last_name, account_number, balance, 'Customer' as role_name, 'Customer' as role
                 FROM customers WHERE id = ?`,
                [req.user.id]
            );
            if (customers.length === 0) return res.status(404).json({ message: 'Not found' });
            return res.json(customers[0]);
        }

        const [users] = await pool.query(
            `SELECT u.id, u.username, u.first_name, u.last_name, u.designation, u.staff_id, r.name as role_name, r.name as role
             FROM users u 
             LEFT JOIN roles r ON u.role_id = r.id 
             WHERE u.id = ?`,
            [req.user.id]
        );
        if (users.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json(users[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

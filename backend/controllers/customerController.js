const pool = require('../db');
const bcrypt = require('bcryptjs');

exports.getCustomers = async (req, res) => {
    try {
        const [customers] = await pool.query(
            `SELECT id, username, first_name, last_name, account_number, balance, created_at 
             FROM customers 
             ORDER BY created_at DESC`
        );
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createCustomer = async (req, res) => {
    const { username, password, first_name, last_name } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Generate a random 10 digit account number
        const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        
        await pool.query(
            `INSERT INTO customers (username, password_hash, first_name, last_name, account_number, balance) VALUES (?, ?, ?, ?, ?, ?)`,
            [username, hashedPassword, first_name, last_name, accountNumber, 0.00]
        );

        // Audit Log for customer creation
        if (req.user && req.user.id) {
            await pool.query(
                `INSERT INTO audit_logs (action, module, details, user_id, ip_address) VALUES (?, ?, ?, ?, ?)`,
                ['CREATE_CUSTOMER', 'Customers', `Created customer account for ${first_name} ${last_name}`, req.user.id, req.ip]
            );
        }

        res.status(201).json({ message: "Customer account created successfully", account_number: accountNumber });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Username already exists" });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.getCustomerProfile = async (req, res) => {
    try {
        // req.user is set by auth middleware, and for customers it should have the id
        const [customers] = await pool.query(
            `SELECT id, username, first_name, last_name, account_number, balance, created_at 
             FROM customers 
             WHERE id = ?`,
            [req.user.id]
        );
        if (customers.length === 0) return res.status(404).json({ message: "Customer not found" });
        res.json(customers[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

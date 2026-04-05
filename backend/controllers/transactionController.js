const pool = require('../db');

exports.getTransactions = async (req, res) => {
    try {
        const [transactions] = await pool.query(
            `SELECT t.*, c.first_name, c.last_name, c.account_number 
             FROM transactions t
             JOIN customers c ON t.customer_id = c.id
             ORDER BY t.created_at DESC LIMIT 100`
        );
        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.getCustomerTransactions = async (req, res) => {
    try {
        // req.user.id is the customer ID from JWT
        const customerId = req.user.id;
        const [transactions] = await pool.query(
            `SELECT * FROM transactions WHERE customer_id = ? ORDER BY created_at DESC`,
            [customerId]
        );
        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.performTransaction = async (req, res) => {
    // Expected roles: Customer
    const { type, amount, destination_account } = req.body;
    const customerId = req.user.id;
    const txAmount = parseFloat(amount);

    if (!txAmount || txAmount <= 0) return res.status(400).json({ message: "Invalid amount" });

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Lock row to prevent race conditions during balance check
        const [customerRows] = await connection.query(`SELECT balance, first_name, last_name FROM customers WHERE id = ? FOR UPDATE`, [customerId]);
        if (customerRows.length === 0) throw new Error("Customer not found");
        
        let currentBalance = parseFloat(customerRows[0].balance);
        const customerDetails = customerRows[0];

        if (type === 'WITHDRAWAL' || type === 'TRANSFER') {
            if (currentBalance < txAmount) {
                await connection.rollback();
                return res.status(400).json({ message: "Insufficient funds" });
            }
        }

        let newBalance = currentBalance;

        if (type === 'DEPOSIT') {
            newBalance += txAmount;
            await connection.query(`UPDATE customers SET balance = ? WHERE id = ?`, [newBalance, customerId]);
        } else if (type === 'WITHDRAWAL') {
            newBalance -= txAmount;
            await connection.query(`UPDATE customers SET balance = ? WHERE id = ?`, [newBalance, customerId]);
        } else if (type === 'TRANSFER') {
             if (!destination_account) {
                 await connection.rollback();
                 return res.status(400).json({ message: "Destination account required for transfer" });
             }
             const [destAccountRows] = await connection.query(`SELECT id, balance FROM customers WHERE account_number = ? FOR UPDATE`, [destination_account]);
             if (destAccountRows.length === 0) {
                 await connection.rollback();
                 return res.status(404).json({ message: "Destination account not found" });
             }
             
             newBalance -= txAmount;
             await connection.query(`UPDATE customers SET balance = ? WHERE id = ?`, [newBalance, customerId]);

             let destBalance = parseFloat(destAccountRows[0].balance);
             destBalance += txAmount;
             await connection.query(`UPDATE customers SET balance = ? WHERE id = ?`, [destBalance, destAccountRows[0].id]);
        } else {
             await connection.rollback();
             return res.status(400).json({ message: "Invalid transaction type" });
        }

        const ip = req.ip || '0.0.0.0';
        const geo = 'Kampala, UG'; // In production, resolve IP to Geo
        const device = req.headers['user-agent'] || 'Web Browser';

        const [txResult] = await connection.query(
            `INSERT INTO transactions (transaction_type, amount, location_ip, location_geo, device_used, customer_id, destination_account) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [type, txAmount, ip, geo, device, customerId, destination_account || null]
        );

        await connection.commit();

        const newTransaction = {
            id: txResult.insertId,
            transaction_type: type,
            amount: txAmount,
            location_ip: ip,
            location_geo: geo,
            device_used: device,
            customer_id: customerId,
            first_name: customerDetails.first_name,
            last_name: customerDetails.last_name,
            destination_account: destination_account || null,
            created_at: new Date()
        };

        // Emit real-time event
        if (req.io) req.io.emit('new_transaction', newTransaction);

        res.status(201).json({ message: "Transaction successful", balance: newBalance });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};

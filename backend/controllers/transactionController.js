const pool = require('../db');

exports.getTransactions = async (req, res) => {
    try {
        const [transactions] = await pool.query(
            `SELECT * FROM transactions ORDER BY created_at DESC LIMIT 100`
        );
        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.simulateTransaction = async (req, res) => {
    try {
        const types = ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER'];
        const type = types[Math.floor(Math.random() * types.length)];
        const amount = (Math.random() * 5000 + 10).toFixed(2);
        
        let ipSegments = [];
        for (let i = 0; i < 4; i++) ipSegments.push(Math.floor(Math.random() * 255));
        const ip = ipSegments.join('.');
        
        const locations = ['Kampala, UG', 'Entebbe, UG', 'Mbarara, UG', 'Nairobi, KE', 'London, UK'];
        const geo = locations[Math.floor(Math.random() * locations.length)];
        
        const devices = ['Mobile App', 'Web Browser', 'ATM', 'USSD'];
        const device = devices[Math.floor(Math.random() * devices.length)];

        const customer_id = Math.floor(Math.random() * 1000) + 1;

        const [result] = await pool.query(
            `INSERT INTO transactions (transaction_type, amount, location_ip, location_geo, device_used, customer_id) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [type, amount, ip, geo, device, customer_id]
        );

        const newTransaction = {
            id: result.insertId,
            transaction_type: type,
            amount: parseFloat(amount),
            location_ip: ip,
            location_geo: geo,
            device_used: device,
            customer_id: customer_id,
            created_at: new Date()
        };

        // Emit real-time event via Socket.IO
        if (req.io) {
            req.io.emit('new_transaction', newTransaction);
        }

        res.status(201).json(newTransaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

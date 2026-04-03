const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

// Database Connection
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'irebas_user',
    password: process.env.DB_PASSWORD || 'irebas_password',
    database: process.env.DB_NAME || 'irebas',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Check DB Connection
pool.getConnection()
    .then(conn => {
        console.log("Connected to MySQL database.");
        conn.release();
    })
    .catch(err => {
        console.error("Error connecting to database:", err);
    });

// Basic route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'IREBAS Backend is running' });
});

// Socket.io for Real-time alerts
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

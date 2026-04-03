const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
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

// Make io accessible to our router
app.use((req, res, next) => {
    req.io = io;
    next();
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/security', require('./routes/securityRoutes'));
app.use('/api/incidents', require('./routes/incidentRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/audit-logs', require('./routes/auditRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Basic health route
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

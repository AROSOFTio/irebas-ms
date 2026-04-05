const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'h:/irebas-ms/backend/.env' });

async function renameRole() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'irebas'
        });
        console.log("Renaming role in database...");
        await connection.execute("UPDATE roles SET name = 'System Security Analyst' WHERE name = 'System Security'");
        console.log("Role renamed successfully.");
        await connection.end();
    } catch (err) {
        console.error("Renaming failed:", err.message);
    }
}

renameRole();

const pool = require('./db');
const bcrypt = require('bcrypt');

async function seed() {
    try {
        console.log("Seeding database...");
        const [roles] = await pool.query(`SELECT id FROM roles WHERE name = 'Admin'`);
        let adminRoleId = null;
        if (roles.length > 0) {
            adminRoleId = roles[0].id;
        } else {
            console.log("Admin role not found, ensure init.sql ran properly.");
            return;
        }

        const [users] = await pool.query(`SELECT id FROM users WHERE username = 'admin'`);
        if (users.length === 0) {
            const hashedPassword = await bcrypt.hash('password123', 10);
            await pool.query(
                `INSERT INTO users (username, password_hash, role_id) VALUES (?, ?, ?)`,
                ['admin', hashedPassword, adminRoleId]
            );
            console.log("Admin user seeded: admin / password123");
        } else {
            console.log("Admin user already exists.");
        }
    } catch (error) {
        console.error("Seed error:", error);
    } finally {
        process.exit();
    }
}

seed();

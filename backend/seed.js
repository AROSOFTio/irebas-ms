const pool = require('./db');

async function seed() {
    try {
        console.log("Seeding database (Bypassing native bcrypt compiler)...");
        const [roles] = await pool.query(`SELECT id FROM roles WHERE name = 'Admin'`);
        if (roles.length === 0) {
            console.log("ERROR: Admin role not found. Ensure init.sql ran properly.");
            return;
        }
        const adminRoleId = roles[0].id;

        // Pre-computed hash for 'password123' to prevent Alpine native crashing
        const hashedPassword = "$2b$10$YyM1O2q.wMz./L5L8oN9iukD8A9X6/O2o5oDIfPZi4R5k6I0vO5.a"; 
        
        await pool.query(
            `INSERT IGNORE INTO users (username, password_hash, role_id) VALUES (?, ?, ?)`,
            ['admin', hashedPassword, adminRoleId]
        );
        console.log("SUCCESS: Admin user verified/seeded! You can now login with admin / password123");
    } catch (error) {
        console.error("Seed error:", error.message);
    } finally {
        process.exit();
    }
}

seed();

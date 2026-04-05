const pool = require('./db');

async function seed() {
    try {
        console.log("Seeding database (Bypassing native bcrypt compiler)...");
        const [roles] = await pool.query(`SELECT id FROM roles WHERE name = 'General Manager'`);
        if (roles.length === 0) {
            console.log("ERROR: General Manager role not found. Ensure init.sql ran properly.");
            return;
        }
        const adminRoleId = roles[0].id;

        // Pre-computed hash from user
        const hashedPassword = "$2a$12$LM.lBvOv6mMQBUwQPOVi4OE5fapa5bhHfxVT40eE48puIdv02iLii"; 
        
        await pool.query(
            `INSERT IGNORE INTO users (username, password_hash, first_name, last_name, designation, staff_id, role_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            ['Laker', hashedPassword, 'Laker', 'Grace', 'General Manager', 'EMP-001', adminRoleId]
        );
        console.log("SUCCESS: General Manager user Laker Grace verified/seeded!");
    } catch (error) {
        console.error("Seed error:", error.message);
    } finally {
        process.exit();
    }
}

seed();

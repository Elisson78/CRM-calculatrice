const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

async function debugUsers() {
    const pool = new Pool({ connectionString });
    try {
        const client = await pool.connect();

        console.log('--- Table Schema: users ---');
        const schema = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");
        console.table(schema.rows);

        console.log('\n--- Users Data (first 5) ---');
        const users = await client.query("SELECT id, email, password_hash, role, nom FROM users LIMIT 5");
        console.table(users.rows);

        client.release();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

debugUsers();

const { Pool } = require('pg');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function testUpdate() {
    const email = 'uzualelisson@gmail.com';
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000);

    console.log(`Testing update for ${email}`);
    console.log(`Token: ${token}`);
    console.log(`Expiry: ${expiry.toISOString()}`);

    try {
        const res = await pool.query(
            'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3',
            [token, expiry, email]
        );
        console.log('Rows updated:', res.rowCount);

        const check = await pool.query('SELECT reset_password_token, reset_password_expires FROM users WHERE email = $1', [email]);
        console.log('Result in DB:', JSON.stringify(check.rows[0], null, 2));

    } catch (err) {
        console.error('Update failed:', err);
    } finally {
        await pool.end();
    }
}

testUpdate();

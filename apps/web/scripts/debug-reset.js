const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function debug() {
    const email = 'uzualelisson@gmail.com';
    console.log(`Checking user: ${email}`);

    try {
        const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (res.rows.length === 0) {
            console.log('User not found!');
        } else {
            console.log('User found:', JSON.stringify(res.rows[0], null, 2));
        }

        console.log('\nEmail Config:');
        console.log('EMAIL_USER:', process.env.EMAIL_USER);
        console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET (length: ' + process.env.EMAIL_PASS.length + ')' : 'NOT SET');
        console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

debug();

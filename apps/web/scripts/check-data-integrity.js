const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

async function checkIntegrity() {
    const pool = new Pool({ connectionString });
    try {
        const client = await pool.connect();

        console.log('\n--- Checking for devis without entreprise_id ---');
        const orphans = await client.query('SELECT id, numero, client_email, created_at FROM devis WHERE entreprise_id IS NULL');

        if (orphans.rows.length > 0) {
            console.log(`\n\x1b[31mWARNING: Found ${orphans.rows.length} devis without entreprise_id!\x1b[0m`);
            console.log('These records might be visible to everyone or leaked depending on RLS implementation.');
            console.table(orphans.rows);
        } else {
            console.log('\n\x1b[32mOK: No orphaned devis found (all have entreprise_id).\x1b[0m');
        }

        console.log('\n--- Checking for users without entreprise (role=entreprise) ---');
        const usersWithoutEnt = await client.query(`
            SELECT u.id, u.email 
            FROM users u 
            LEFT JOIN entreprises e ON u.id = e.user_id 
            WHERE u.role = 'entreprise' AND e.id IS NULL
        `);

        if (usersWithoutEnt.rows.length > 0) {
            console.log(`\n\x1b[31mWARNING: Found ${usersWithoutEnt.rows.length} entreprise users without associated company!\x1b[0m`);
            console.table(usersWithoutEnt.rows);
        } else {
            console.log('\n\x1b[32mOK: All entreprise users have an associated company.\x1b[0m');
        }

        client.release();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkIntegrity();

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

async function checkUser() {
    const pool = new Pool({ connectionString });
    try {
        const client = await pool.connect();
        const email = 'gs@mail.com';

        console.log(`\n--- Searching for user: ${email} ---`);
        const userResult = await client.query('SELECT id, email, role, nom FROM users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            console.log('User not found.');
            return;
        }

        const user = userResult.rows[0];
        console.table(userResult.rows);

        if (user.role === 'admin') {
            console.log('\nWARNING: User has ADMIN role. Admins can see all devis by design in the current RLS policies.');
        } else if (user.role === 'entreprise') {
            console.log('\n--- Searching for associated entreprise ---');
            const entResult = await client.query('SELECT id, nom, slug FROM entreprises WHERE user_id = $1', [user.id]);
            if (entResult.rows.length === 0) {
                console.log('No entreprise found for this user_id.');
            } else {
                console.table(entResult.rows);
                const entrepriseId = entResult.rows[0].id;

                console.log('\n--- Checking devis visibility via RLS ---');
                // Simulate app context
                await client.query('BEGIN');
                await client.query("SELECT set_config('app.current_user_id', $1, true)", [user.id]);
                await client.query("SELECT set_config('app.current_entreprise_id', $1, true)", [entrepriseId]);
                await client.query("SELECT set_config('app.current_user_role', $1, true)", [user.role]);

                const devisResult = await client.query('SELECT COUNT(*) as total_visible_devis FROM devis');
                console.log(`Total devis visible with RLS: ${devisResult.rows[0].total_visible_devis}`);

                const leakedResult = await client.query('SELECT COUNT(*) as leaked_devis FROM devis WHERE entreprise_id != $1 OR entreprise_id IS NULL', [entrepriseId]);
                console.log(`Leaked devis (wrong entreprise_id): ${leakedResult.rows[0].leaked_devis}`);

                await client.query('ROLLBACK');
            }
        }

        client.release();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkUser();

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('🔌 Connected to database');

        // Check if column exists
        const checkRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='devis' AND column_name='nombre_demenageurs';
    `);

        if (checkRes.rows.length === 0) {
            console.log('🚧 Column nombre_demenageurs missing. Adding it...');
            await client.query(`
        ALTER TABLE devis 
        ADD COLUMN nombre_demenageurs INTEGER DEFAULT NULL;
      `);
            console.log('✅ Column nombre_demenageurs added successfully.');
        } else {
            console.log('✅ Column nombre_demenageurs already exists.');
        }

    } catch (err) {
        console.error('❌ Error running migration:', err);
    } finally {
        client.release();
        pool.end();
    }
}

migrate();

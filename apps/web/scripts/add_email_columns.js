const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:Bradok41@72.62.36.167:5432/crm_demo?schema=public',
});

async function runMigration() {
    try {
        await client.connect();
        console.log('Connected to database');

        const columns = [
            'email_notification_1',
            'email_notification_2',
            'email_notification_3'
        ];

        for (const col of columns) {
            console.log(`Checking if column ${col} exists...`);
            const checkRes = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='entreprises' AND column_name=$1
      `, [col]);

            if (checkRes.rowCount === 0) {
                console.log(`Adding column ${col}...`);
                await client.query(`ALTER TABLE entreprises ADD COLUMN ${col} TEXT`);
                console.log(`Column ${col} added successfully.`);
            } else {
                console.log(`Column ${col} already exists.`);
            }
        }

        console.log('Migration completed.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

runMigration();

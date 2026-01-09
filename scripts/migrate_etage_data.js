const { Pool } = require('pg');

const dbUrl = 'postgresql://postgres:Bradok41@72.62.36.167:5432/crm_demo?schema=public';
const pool = new Pool({ connectionString: dbUrl });

(async () => {
    try {
        const r = await pool.query("SELECT id, numero, observations FROM devis");
        console.log('Scanning', r.rows.length, 'quotes...');

        let count = 0;
        for (const row of r.rows) {
            if (!row.observations) continue;

            const departMatch = row.observations.match(/[EÉ]tage d[eé]part:\s*(\d+)/i);
            const arriveeMatch = row.observations.match(/[EÉ]tage arriv[eé]e:\s*(\d+)/i);

            if (departMatch || arriveeMatch) {
                const etDepart = departMatch ? parseInt(departMatch[1]) : 0;
                const etArrivee = arriveeMatch ? parseInt(arriveeMatch[1]) : 0;

                await pool.query(
                    "UPDATE devis SET etage_depart = $1, etage_arrivee = $2 WHERE id = $3",
                    [etDepart, etArrivee, row.id]
                );
                console.log(`✅ Updated ${row.numero} (${row.id}) -> ${etDepart} / ${etArrivee}`);
                count++;
            }
        }
        console.log(`Done! Successfully migrated ${count} quotes.`);
    } catch (err) {
        console.error('❌ Error during migration:', err);
    } finally {
        await pool.end();
    }
})();

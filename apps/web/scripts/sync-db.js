const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configurações (Ajuste conforme necessário)
const PROD_CONFIG = {
    connectionString: "postgresql://postgres:Bradok41@72.62.36.167:5432/crm_demo",
};

// Tenta pegar a URL do banco local do .env.local ou usa o padrão
let LOCAL_URL = "postgresql://postgres:postgres@localhost:5432/crm_demenagement";

try {
    const envPath = path.join(__dirname, '../apps/web/.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/DATABASE_URL=["']?(.+?)["']?(\s|$)/);
        if (match) {
            LOCAL_URL = match[1];
            console.log('✅ URL local carregada do .env.local');
        }
    }
} catch (e) {
    console.log('⚠️  Aviso: Não foi possível carregar .env.local, usando URL padrão.');
}

const prodPool = new Pool(PROD_CONFIG);
const localPool = new Pool({ connectionString: LOCAL_URL });

const TABLES = ["entreprises", "categories_meubles", "meubles", "devis", "devis_meubles", "users"];

async function sync() {
    console.log('🐘 Iniciando sincronização via Node.js...');

    try {
        for (const table of TABLES) {
            console.log(`\n📦 Sincronizando tabela: ${table}`);

            // 1. Busca dados da produção
            const prodRes = await prodPool.query(`SELECT * FROM ${table}`);
            console.log(`  📥 Puxou ${prodRes.rows.length} registros da produção.`);

            if (prodRes.rows.length === 0) continue;

            // 2. Limpa tabela local
            await localPool.query(`TRUNCATE TABLE ${table} CASCADE`);
            console.log(`  🧹 Tabela local limpa.`);

            // 3. Insere dados localmente
            const columns = Object.keys(prodRes.rows[0]);
            const queryText = `
        INSERT INTO ${table} (${columns.join(', ')})
        VALUES (${columns.map((_, i) => `$${i + 1}`).join(', ')})
      `;

            for (const row of prodRes.rows) {
                const values = columns.map(col => row[col]);
                await localPool.query(queryText, values);
            }
            console.log(`  ✅ ${prodRes.rows.length} registros inseridos localmente.`);
        }

        console.log('\n✨ Sincronização completa!');
    } catch (err) {
        console.error('\n❌ Erro durante a sincronização:', err.message);
    } finally {
        await prodPool.end();
        await localPool.end();
    }
}

sync();

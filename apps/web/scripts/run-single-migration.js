/**
 * Script para executar uma única migração
 * Usage: node scripts/run-single-migration.js 006
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente
try {
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...values] = line.split('=');
      if (key && values.length > 0) {
        process.env[key.trim()] = values.join('=').trim();
      }
    });
    console.log('✅ Variables d\'environnement chargées depuis .env.local');
  }
} catch (e) {
  console.log('⚠️  Erro ao carregar .env.local');
}

// Pegar número da migração dos argumentos
const migrationNumber = process.argv[2];
if (!migrationNumber) {
  console.error('❌ Por favor, forneça o número da migração. Ex: node scripts/run-single-migration.js 006');
  process.exit(1);
}

const config = {
  host: process.env.DB_HOST || 'junction.proxy.rlwy.net',
  port: parseInt(process.env.DB_PORT || '18657'),
  database: process.env.DB_NAME || 'railway',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Lm5nNl5Dkyl9Nc4aOJYV',
};

const pool = new Pool(config);

async function runSingleMigration() {
  const client = await pool.connect();
  
  try {
    console.log(`🚀 Executando migração ${migrationNumber}...\n`);
    
    // Buscar arquivo de migração
    const migrationPath = path.join(__dirname, `../migrations/${migrationNumber}_*.sql`);
    const glob = require('glob') || null;
    
    // Se glob não estiver disponível, tentar busca manual
    const migrationsDir = path.join(__dirname, '../migrations');
    const files = fs.readdirSync(migrationsDir);
    const migrationFile = files.find(file => file.startsWith(`${migrationNumber}_`));
    
    if (!migrationFile) {
      throw new Error(`Arquivo de migração não encontrado para: ${migrationNumber}`);
    }
    
    const fullPath = path.join(migrationsDir, migrationFile);
    const migrationSQL = fs.readFileSync(fullPath, 'utf8');
    
    console.log(`📄 Executando ${migrationFile}...`);
    await client.query(migrationSQL);
    console.log(`✅ Migração ${migrationNumber} aplicada com sucesso!\n`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runSingleMigration();
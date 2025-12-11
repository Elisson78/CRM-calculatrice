/**
 * Script de migration de la base de données
 * Usage: node scripts/migrate.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'crm_demenagement',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Démarrage des migrations...\n');
    
    // Lire le fichier de migration
    const migrationPath = path.join(__dirname, '../../../supabase/migrations/001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Exécution de 001_initial_schema.sql...');
    await client.query(migrationSQL);
    console.log('✅ Migration 001 appliquée avec succès!\n');
    
    console.log('🎉 Toutes les migrations ont été appliquées!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();




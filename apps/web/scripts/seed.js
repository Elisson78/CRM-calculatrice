/**
 * Script de seed de la base de données
 * Usage: node scripts/seed.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration
const pool = new Pool(
  process.env.DATABASE_URL 
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'crm_demenagement',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
      }
);

async function runSeed() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Démarrage du seed...\n');
    
    // Lire le fichier de seed
    const seedPath = path.join(__dirname, '../../../supabase/seed.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    
    console.log('📄 Exécution de seed.sql...');
    await client.query(seedSQL);
    console.log('✅ Seed appliqué avec succès!\n');
    
    // Afficher les statistiques
    const stats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM categories_meubles) as categories,
        (SELECT COUNT(*) FROM meubles) as meubles,
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM entreprises) as entreprises
    `);
    
    console.log('📊 Statistiques:');
    console.log(`   - Catégories: ${stats.rows[0].categories}`);
    console.log(`   - Meubles: ${stats.rows[0].meubles}`);
    console.log(`   - Users: ${stats.rows[0].users}`);
    console.log(`   - Entreprises: ${stats.rows[0].entreprises}`);
    
    console.log('\n🎉 Base de données initialisée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed();










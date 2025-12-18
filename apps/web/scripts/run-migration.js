/**
 * Script de migration avec configuration directe
 * Usage: DB_PASSWORD=votre_mot_de_passe node scripts/run-migration.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Tenter de charger les variables d'environnement depuis .env.local
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
  console.log('⚠️  Pas de fichier .env.local trouvé, utilisation des valeurs par défaut');
}

// Configuration
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'crm_demenagement',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

console.log(`\n📦 Connexion à PostgreSQL:`);
console.log(`   Host: ${config.host}:${config.port}`);
console.log(`   Database: ${config.database}`);
console.log(`   User: ${config.user}\n`);

const pool = new Pool(config);

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Démarrage des migrations...\n');
    
    // Lire le fichier de migration
    const migrationPath = path.join(__dirname, '../../../supabase/migrations/001_initial_schema.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Fichier de migration non trouvé: ${migrationPath}`);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Exécution de 001_initial_schema.sql...');
    await client.query(migrationSQL);
    console.log('✅ Migration 001 appliquée avec succès!\n');
    
    // Maintenant exécuter le seed
    const seedPath = path.join(__dirname, '../../../supabase/seed.sql');
    
    if (fs.existsSync(seedPath)) {
      console.log('🌱 Exécution de seed.sql...');
      const seedSQL = fs.readFileSync(seedPath, 'utf8');
      await client.query(seedSQL);
      console.log('✅ Seed appliqué avec succès!\n');
    }
    
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
    console.log('\n👉 Vous pouvez maintenant accéder à:');
    console.log('   http://localhost:3000/calculatrice/vsr-demenagement\n');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    
    if (error.message.includes('password')) {
      console.log('\n💡 Conseil: Vérifiez le mot de passe PostgreSQL dans .env.local');
      console.log('   Ou exécutez: DB_PASSWORD=votre_mot_de_passe node scripts/run-migration.js');
    }
    
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();










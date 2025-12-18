/**
 * Script pour exécuter toutes les migrations en séquence
 * Usage: node scripts/run-all-migrations.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement
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
  }
} catch (e) {
  console.log('⚠️  Pas de .env.local, utilisation des valeurs par défaut');
}

// Configuration de la base de données (forcer production)
const config = {
  host: '72.62.36.167',
  port: 5432,
  database: 'crm_demo',
  user: 'postgres', 
  password: 'Bradok41',
};

const pool = new Pool(config);

// Liste des migrations à exécuter dans l'ordre
const migrations = [
  '../migrations/005_add_logo_size.sql',
  '../migrations/006_add_logo_data.sql'
];

async function runAllMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Exécution des migrations manquantes...\n');
    
    for (const migrationFile of migrations) {
      const migrationPath = path.join(__dirname, migrationFile);
      
      if (!fs.existsSync(migrationPath)) {
        console.log(`⚠️  Migration non trouvée: ${migrationPath}`);
        continue;
      }
      
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      console.log(`📄 Exécution de ${path.basename(migrationPath)}...`);
      
      try {
        await client.query(migrationSQL);
        console.log(`✅ Migration ${path.basename(migrationPath)} appliquée avec succès!`);
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('duplicate column')) {
          console.log(`⚠️  Migration ${path.basename(migrationPath)} déjà appliquée`);
        } else {
          throw error;
        }
      }
    }
    
    // Vérifier que la colonne logo_size existe
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'entreprises' AND column_name = 'logo_size'
    `);
    
    if (columnCheck.rows.length > 0) {
      console.log('✅ Colonne logo_size confirmée dans la table entreprises');
    } else {
      console.log('❌ Colonne logo_size manquante - migration échouée');
    }
    
    console.log('\n🎉 Migrations terminées!');
    
  } catch (error) {
    console.error('❌ Erreur lors des migrations:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runAllMigrations();
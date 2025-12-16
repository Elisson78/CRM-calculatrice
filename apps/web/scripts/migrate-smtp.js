/**
 * Script para adicionar campos SMTP
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
const connectionString = process.env.DATABASE_URL;
console.log('🔗 Usando DATABASE_URL:', connectionString?.replace(/:[^:@]*@/, ':***@'));

const pool = new Pool({
  connectionString: connectionString,
});


async function migrateSMTP() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Ajout des champs SMTP...\n');
    
    // Vérifier si les colonnes existent déjà
    const checkColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'entreprises' 
        AND column_name IN ('smtp_host', 'smtp_port', 'smtp_user', 'smtp_password', 'smtp_secure', 'use_custom_smtp')
    `);
    
    if (checkColumns.rows.length > 0) {
      console.log('✅ Colonnes SMTP déjà présentes');
      return;
    }
    
    // Ajouter les colonnes
    const migrationSQL = `
      -- Ajouter fields de configuration SMTP na tabla empresas
      ALTER TABLE entreprises 
      ADD COLUMN IF NOT EXISTS smtp_host VARCHAR(255),
      ADD COLUMN IF NOT EXISTS smtp_port INTEGER,
      ADD COLUMN IF NOT EXISTS smtp_user VARCHAR(255), 
      ADD COLUMN IF NOT EXISTS smtp_password TEXT,
      ADD COLUMN IF NOT EXISTS smtp_secure BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS use_custom_smtp BOOLEAN DEFAULT FALSE;
    `;
    
    console.log('📄 Exécution de la migration SMTP...');
    await client.query(migrationSQL);
    console.log('✅ Migration SMTP appliquée avec succès!\n');
    
    console.log('🎉 Champs SMTP ajoutés à la table entreprises!');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrateSMTP();
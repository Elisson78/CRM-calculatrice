/**
 * Script para verificar devis no banco de dados
 * Usage: node scripts/check-devis.js
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

const pool = new Pool(config);

async function checkDevis() {
  const client = await pool.connect();
  
  try {
    console.log('\n🔍 Vérification des devis...\n');
    
    // 1. Verificar se a tabela existe
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'devis'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ A tabela devis não existe!');
      return;
    }
    console.log('✅ Tabela devis existe');
    
    // 2. Contar total de devis
    const totalDevis = await client.query('SELECT COUNT(*) as total FROM devis');
    console.log(`📊 Total de devis: ${totalDevis.rows[0].total}`);
    
    // 3. Listar todas as empresas
    const entreprises = await client.query('SELECT id, nom, slug FROM entreprises');
    console.log(`\n🏢 Entreprises encontradas: ${entreprises.rows.length}`);
    entreprises.rows.forEach(ent => {
      console.log(`   - ${ent.nom} (ID: ${ent.id}, slug: ${ent.slug})`);
    });
    
    // 4. Para cada empresa, contar devis
    for (const ent of entreprises.rows) {
      const devisCount = await client.query(
        'SELECT COUNT(*) as total FROM devis WHERE entreprise_id = $1',
        [ent.id]
      );
      console.log(`\n   Devis para ${ent.nom}: ${devisCount.rows[0].total}`);
      
      if (parseInt(devisCount.rows[0].total) > 0) {
        const devis = await client.query(
          'SELECT id, numero, client_nom, statut, created_at FROM devis WHERE entreprise_id = $1 ORDER BY created_at DESC LIMIT 5',
          [ent.id]
        );
        console.log('   Últimos devis:');
        devis.rows.forEach(d => {
          console.log(`     - ${d.numero}: ${d.client_nom} (${d.statut}) - ${new Date(d.created_at).toLocaleDateString()}`);
        });
      }
    }
    
    // 5. Verificar se os campos novos existem
    try {
      const columns = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'devis' 
        AND column_name IN ('montant_estime', 'nombre_demenageurs', 'devise')
      `);
      console.log(`\n📋 Campos opcionais encontrados: ${columns.rows.map(r => r.column_name).join(', ') || 'Nenhum'}`);
    } catch (e) {
      console.log('\n⚠️  Erro ao verificar colunas:', e.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkDevis();







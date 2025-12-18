/**
 * Script para obter IDs reais de móveis
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
  }
} catch (e) {
  console.log('⚠️  Erro ao carregar .env.local');
}

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'crm_demenagement',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

const pool = new Pool(config);

async function getRealMeubles() {
  const client = await pool.connect();
  
  try {
    console.log('🛋️ Buscando móveis reais da base de dados...\n');
    
    const meubles = await client.query(`
      SELECT 
        m.id,
        m.nom,
        m.volume_m3,
        m.poids_kg,
        c.nom as categorie_nom
      FROM meubles m
      JOIN categories_meubles c ON m.categorie_id = c.id
      WHERE m.actif = true
      ORDER BY c.nom, m.nom
      LIMIT 10
    `);
    
    console.log(`📋 ${meubles.rows.length} móveis encontrados:\n`);
    
    meubles.rows.forEach((meuble, index) => {
      console.log(`${index + 1}. ${meuble.nom}`);
      console.log(`   ID: ${meuble.id}`);
      console.log(`   Categoria: ${meuble.categorie_nom}`);
      console.log(`   Volume: ${meuble.volume_m3} m³`);
      console.log(`   Peso: ${meuble.poids_kg} kg`);
      console.log();
    });
    
    // Gerar payload correto para teste
    const testMeubles = meubles.rows.slice(0, 2).map(m => ({
      meuble_id: m.id,
      meuble_nom: m.nom,
      meuble_categorie: m.categorie_nom,
      quantite: 1,
      volume_unitaire_m3: parseFloat(m.volume_m3),
      poids_unitaire_kg: parseFloat(m.poids_kg)
    }));
    
    console.log('🧪 Payload correto para teste:');
    console.log(JSON.stringify(testMeubles, null, 2));
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

getRealMeubles();
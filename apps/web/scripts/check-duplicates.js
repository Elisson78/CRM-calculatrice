require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

// Usar a mesma configuração do db.ts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

async function verificarMóveisDuplicados() {
  const client = await pool.connect();
  try {
    console.log('🔍 Verificando móveis duplicados...');
    
    // Verificar se a tabela meubles existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'meubles'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Tabela "meubles" não encontrada no banco de dados.');
      return;
    }
    
    // Contar total de móveis
    const totalResult = await client.query('SELECT COUNT(*) as total FROM meubles');
    console.log(`📊 Total de móveis no banco: ${totalResult.rows[0].total}`);
    
    // Verificar duplicados por nome e categoria
    const duplicadosResult = await client.query(`
      SELECT 
        nom, 
        categorie_id, 
        COUNT(*) as count,
        STRING_AGG(id::text, ', ') as ids
      FROM meubles
      GROUP BY nom, categorie_id
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);
    
    if (duplicadosResult.rows.length > 0) {
      console.log(`\n⚠️  Encontrados ${duplicadosResult.rows.length} grupos de móveis duplicados:`);
      duplicadosResult.rows.forEach(dup => {
        console.log(`   - ${dup.nom} (categoria ${dup.categorie_id}): ${dup.count} cópias (IDs: ${dup.ids})`);
      });
    } else {
      console.log('\n✅ Nenhum móvel duplicado encontrado!');
    }
    
    // Verificar estrutura da tabela
    const structureResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'meubles' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Estrutura da tabela meubles:');
    structureResult.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Executar a verificação
verificarMóveisDuplicados()
  .then(() => {
    console.log('\n🏁 Verificação finalizada!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Falha na verificação:', error);
    process.exit(1);
  });
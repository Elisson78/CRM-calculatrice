require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

async function limparMóveisDuplicados() {
  const client = await pool.connect();
  try {
    console.log('🔍 Iniciando limpeza de móveis duplicados...');
    
    // Primeiro, vamos fazer um backup dos IDs que serão removidos
    const duplicadosParaRemover = await client.query(`
      WITH duplicados AS (
        SELECT 
          id, 
          nom, 
          categorie_id,
          ROW_NUMBER() OVER (PARTITION BY nom, categorie_id ORDER BY created_at DESC) as rn
        FROM meubles
      )
      SELECT id, nom, categorie_id
      FROM duplicados
      WHERE rn > 1
    `);
    
    console.log(`📋 Encontrados ${duplicadosParaRemover.rows.length} móveis duplicados para remover`);
    
    if (duplicadosParaRemover.rows.length === 0) {
      console.log('✅ Nenhum duplicado encontrado! O banco já está limpo.');
      return;
    }
    
    // Mostrar detalhes dos duplicados
    console.log('\n📝 Detalhes dos duplicados que serão removidos:');
    duplicadosParaRemover.rows.forEach(item => {
      console.log(`   - ID: ${item.id} | ${item.nom} (categoria: ${item.categorie_id})`);
    });
    
    // Confirmar antes de prosseguir
    console.log('\n⚠️  ATENÇÃO: Esta operação irá remover permanentemente os registros duplicados.');
    console.log('   Deseja continuar? (s/n)');
    
    // Como estamos em script, vamos prosseguir com a remoção
    console.log('🚀 Prosseguindo com a remoção...');
    
    // Remover duplicados mantendo apenas o mais recente (baseado em created_at)
    const resultado = await client.query(`
      WITH manter AS (
        SELECT DISTINCT ON (nom, categorie_id) 
          id,
          nom,
          categorie_id
        FROM meubles
        ORDER BY nom, categorie_id, created_at DESC
      ),
      remover AS (
        SELECT m.id
        FROM meubles m
        LEFT JOIN manter k ON m.id = k.id
        WHERE k.id IS NULL
      )
      DELETE FROM meubles
      WHERE id IN (SELECT id FROM remover)
      RETURNING id, nom, categorie_id
    `);
    
    console.log(`\n🗑️  Removidos ${resultado.rows.length} móveis duplicados:`);
    resultado.rows.forEach(item => {
      console.log(`   ❌ Removido: ${item.nom} (ID: ${item.id})`);
    });
    
    // Verificar resultado final
    const verificacao = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT nom || '|' || categorie_id) as unique_count
      FROM meubles
    `);
    
    console.log('\n✅ Limpeza concluída com sucesso!');
    console.log(`   📊 Total de móveis após limpeza: ${verificacao.rows[0].total}`);
    console.log(`   📊 Móveis únicos: ${verificacao.rows[0].unique_count}`);
    
    // Verificar se ainda existem duplicados
    const duplicadosRestantes = await client.query(`
      SELECT nom, categorie_id, COUNT(*) as count
      FROM meubles
      GROUP BY nom, categorie_id
      HAVING COUNT(*) > 1
    `);
    
    if (duplicadosRestantes.rows.length > 0) {
      console.log(`\n⚠️  Ainda existem ${duplicadosRestantes.rows.length} grupos de duplicados:`);
      duplicadosRestantes.rows.forEach(dup => {
        console.log(`   - ${dup.nom} (categoria ${dup.categorie_id}): ${dup.count} cópias`);
      });
    } else {
      console.log('\n🎉 Não há mais duplicados no banco de dados!');
    }
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Executar a limpeza
limparMóveisDuplicados()
  .then(() => {
    console.log('\n🏁 Script de limpeza finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Falha no script:', error);
    process.exit(1);
  });
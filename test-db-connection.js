/**
 * Script de Teste de Conexão com PostgreSQL
 * Testa a conexão com o banco de dados externo
 */

require('dotenv').config({ path: '.env.local' });

// Verifica se está usando pg (PostgreSQL client para Node.js)
// Se não tiver instalado, execute: npm install pg dotenv

async function testConnection() {
  try {
    // Tenta usar o cliente pg se disponível
    let pg;
    try {
      pg = require('pg');
    } catch (err) {
      console.error('❌ Erro: Pacote "pg" não encontrado.');
      console.log('\n📦 Para instalar, execute:');
      console.log('   npm install pg dotenv\n');
      process.exit(1);
    }

    const { Pool } = pg;
    
    // Constrói a string de conexão ou usa a URL direta
    const connectionString = process.env.DATABASE_URL || 
      `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?schema=${process.env.DB_SCHEMA || 'public'}`;

    console.log('🔄 Tentando conectar ao banco de dados...\n');
    console.log(`📍 Host: ${process.env.DB_HOST || 'NÃO CONFIGURADO'}`);
    console.log(`📊 Database: ${process.env.DB_NAME || 'NÃO CONFIGURADO'}\n`);

    const pool = new Pool({
      connectionString: connectionString,
      ssl: false, // Altere para true se o servidor exigir SSL
    });

    // Testa a conexão
    const client = await pool.connect();
    
    console.log('✅ Conexão estabelecida com sucesso!\n');

    // Executa uma query de teste
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    
    console.log('📅 Data/Hora do Servidor:', result.rows[0].current_time);
    console.log('🗄️  Versão PostgreSQL:', result.rows[0].pg_version.split(',')[0]);
    console.log('\n');

    // Lista as tabelas do banco
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log(`📋 Tabelas encontradas (${tablesResult.rows.length}):`);
    tablesResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });

    // Libera o cliente
    client.release();
    await pool.end();

    console.log('\n✅ Teste de conexão concluído com sucesso!');
    console.log('🎉 O banco de dados está pronto para uso.\n');

  } catch (error) {
    console.error('\n❌ Erro ao conectar ao banco de dados:\n');
    console.error(`   ${error.message}\n`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Verifique se:');
      console.error('   - O servidor PostgreSQL está rodando');
      console.error('   - O host e porta estão corretos');
      console.error('   - O firewall permite conexões na porta 5432\n');
    } else if (error.code === '28P01') {
      console.error('💡 Erro de autenticação. Verifique:');
      console.error('   - Usuário e senha estão corretos');
      console.error('   - O usuário tem permissão para acessar o banco\n');
    } else if (error.code === '3D000') {
      console.error('💡 Banco de dados não encontrado. Verifique:');
      console.error('   - O nome do banco está correto\n');
    }
    
    process.exit(1);
  }
}

// Executa o teste
testConnection();




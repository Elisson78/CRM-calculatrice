/**
 * Script de Verificação Completa das Variáveis de Ambiente
 * Baseado na imagem de configuração compartilhada
 * Usage: node scripts/check-environment.js
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

// Cores para output no terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log('\n' + '='.repeat(60), 'cyan');
  log(`📋 ${title}`, 'cyan');
  log('='.repeat(60), 'cyan');
}

function checkVariable(varName, required = true, description = '') {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const color = value ? 'green' : 'red';
  
  log(`${status} ${varName}`, color);
  if (description) {
    log(`   ${description}`, 'blue');
  }
  if (!value && required) {
    log(`   ⚠️  VARIÁVEL OBRIGATÓRIA NÃO CONFIGURADA!`, 'yellow');
  }
  
  return !!value;
}

function validateDatabaseURL(url) {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'postgresql:' && 
           urlObj.hostname && 
           urlObj.username && 
           urlObj.password && 
           urlObj.pathname;
  } catch {
    return false;
  }
}

function validateEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateJWTSecret(secret) {
  return secret && secret.length >= 16;
}

async function checkDatabaseConnection() {
  logSection('Teste de Conexão com Banco de Dados');
  
  try {
    const { Pool } = require('pg');
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: false,
      connectionTimeoutMillis: 5000,
    });
    
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as server_time, version() as pg_version');
    
    log('✅ Conexão com PostgreSQL estabelecida!', 'green');
    log(`📅 Servidor: ${result.rows[0].server_time}`, 'blue');
    log(`🗄️  Versão: ${result.rows[0].pg_version.split(',')[0]}`, 'blue');
    
    // Verificar tabelas principais
    const tablesQuery = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    log(`📋 Tabelas encontradas: ${tablesQuery.rows.length}`, 'blue');
    tablesQuery.rows.forEach((row, index) => {
      log(`   ${index + 1}. ${row.table_name}`, 'blue');
    });
    
    client.release();
    await pool.end();
    
    return true;
  } catch (error) {
    log(`❌ Erro na conexão: ${error.message}`, 'red');
    return false;
  }
}

function checkFileExists(filePath, description) {
  const exists = fs.existsSync(path.join(process.cwd(), filePath));
  const status = exists ? '✅' : '❌';
  const color = exists ? 'green' : 'red';
  
  log(`${status} ${filePath}`, color);
  if (description) {
    log(`   ${description}`, 'blue');
  }
  
  return exists;
}

async function runEnvironmentCheck() {
  log('🔍 VERIFICAÇÃO COMPLETA DO AMBIENTE CRM DEMENAGEMENT', 'cyan');
  log('Baseado nas configurações da imagem fornecida', 'cyan');
  
  let allGood = true;
  
  // Verificar arquivo .env.local
  logSection('Arquivos de Configuração');
  const envLocalExists = checkFileExists('.env.local', 'Arquivo principal de variáveis de ambiente');
  const envExampleExists = checkFileExists('.env.example', 'Arquivo exemplo de configuração');
  
  if (!envLocalExists) {
    log('\n❌ Arquivo .env.local não encontrado!', 'red');
    log('💡 Execute: cp .env.example .env.local', 'yellow');
    log('   Depois edite o arquivo com suas credenciais reais', 'yellow');
    return false;
  }
  
  // Verificar variáveis obrigatórias
  logSection('Variáveis de Ambiente - Banco de Dados');
  
  const dbUrl = process.env.DATABASE_URL;
  const dbUrlValid = dbUrl && validateDatabaseURL(dbUrl);
  
  checkVariable('DATABASE_URL', true, 'String de conexão PostgreSQL completa');
  checkVariable('DB_HOST', false, 'Host do servidor PostgreSQL');
  checkVariable('DB_PORT', false, 'Porta do PostgreSQL (geralmente 5432)');
  checkVariable('DB_NAME', false, 'Nome do banco de dados');
  checkVariable('DB_USER', false, 'Usuário do PostgreSQL');
  checkVariable('DB_PASSWORD', false, 'Senha do usuário PostgreSQL');
  
  if (!dbUrlValid) {
    log('\n❌ DATABASE_URL inválida ou ausente!', 'red');
    log('💡 Formato esperado: postgresql://usuario:senha@host:porta/banco', 'yellow');
    allGood = false;
  }
  
  logSection('Variáveis de Ambiente - Autenticação');
  
  const jwtValid = validateJWTSecret(process.env.JWT_SECRET);
  checkVariable('JWT_SECRET', true, 'Chave secreta para tokens JWT (mínimo 16 caracteres)');
  
  if (!jwtValid) {
    log('\n❌ JWT_SECRET inválida ou muito curta!', 'red');
    log('💡 Use uma chave secreta forte com pelo menos 16 caracteres', 'yellow');
    allGood = false;
  }
  
  checkVariable('JWT_EXPIRES_IN', false, 'Tempo de expiração do token (ex: 7d)');
  
  logSection('Variáveis de Ambiente - Email');
  
  const emailValid = validateEmail(process.env.EMAIL_USER);
  checkVariable('EMAIL_USER', true, 'Email para envio de mensagens');
  checkVariable('EMAIL_PASS', true, 'Senha do email ou app password');
  checkVariable('EMAIL_HOST', false, 'Servidor SMTP (padrão: smtp.gmail.com)');
  checkVariable('EMAIL_PORT', false, 'Porta SMTP (padrão: 587)');
  
  if (!emailValid) {
    log('\n❌ EMAIL_USER inválido!', 'red');
    log('💡 Use um endereço de email válido', 'yellow');
    allGood = false;
  }
  
  logSection('Variáveis de Ambiente - Aplicação');
  
  checkVariable('NEXT_PUBLIC_APP_URL', false, 'URL pública da aplicação');
  checkVariable('NODE_ENV', false, 'Ambiente (development/staging/production)');
  checkVariable('PORT', false, 'Porta do servidor (padrão: 3000)');
  
  logSection('Variáveis de Ambiente - Stripe (Opcional)');
  
  checkVariable('STRIPE_PUBLISHABLE_KEY', false, 'Chave pública Stripe');
  checkVariable('STRIPE_SECRET_KEY', false, 'Chave secreta Stripe');
  checkVariable('STRIPE_WEBHOOK_SECRET', false, 'Segredo para webhooks Stripe');
  
  // Testar conexão com banco se DATABASE_URL estiver configurada
  if (dbUrlValid) {
    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      allGood = false;
    }
  }
  
  // Verificar arquivos importantes do projeto
  logSection('Arquivos do Projeto');
  
  checkFileExists('package.json', 'Dependências do projeto');
  checkFileExists('apps/web/src/lib/db.ts', 'Configuração do banco de dados TypeScript');
  checkFileExists('apps/web/scripts/setup-database.js', 'Script de setup do banco');
  checkFileExists('test-db-connection.js', 'Script de teste de conexão');
  
  // Resumo final
  logSection('Resumo da Verificação');
  
  if (allGood) {
    log('🎉 SUCESSO! Todas as configurações obrigatórias estão corretas!', 'green');
    log('\n📋 Próximos passos:', 'blue');
    log('   1. Execute: node apps/web/scripts/setup-database.js', 'blue');
    log('   2. Execute: npm run dev', 'blue');
    log('   3. Acesse: http://localhost:3000', 'blue');
  } else {
    log('❌ PROBLEMAS ENCONTRADOS! Verifique os itens marcados acima.', 'red');
    log('\n🔧 Ações necessárias:', 'yellow');
    log('   1. Corrija as variáveis de ambiente no arquivo .env.local', 'yellow');
    log('   2. Execute este script novamente para verificar', 'yellow');
    log('   3. Certifique-se de que o servidor PostgreSQL está acessível', 'yellow');
  }
  
  return allGood;
}

// Executar verificação
if (require.main === module) {
  runEnvironmentCheck()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log(`\n❌ Erro durante a verificação: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = { runEnvironmentCheck };
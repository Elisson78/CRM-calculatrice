/**
 * Script para debug do Stripe em produção
 */

console.log('🔧 DEBUG STRIPE EM PRODUÇÃO\n');

console.log('📋 Variáveis de ambiente detectadas:');

// Mascarar chaves sensíveis
function maskSecret(value) {
  if (!value) return 'NÃO DEFINIDO';
  if (value.length > 20) {
    return `${value.substring(0, 12)}***${value.substring(value.length - 4)}`;
  }
  return `${value.substring(0, 8)}***`;
}

const envVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY', 
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_ID_BASIC',
  'STRIPE_PRICE_ID_PRO', 
  'STRIPE_PRICE_ID_ENTERPRISE',
  'NODE_ENV',
  'DATABASE_URL'
];

envVars.forEach(key => {
  const value = process.env[key];
  const displayValue = key.includes('SECRET') || key.includes('KEY') || key.includes('DATABASE') 
    ? maskSecret(value)
    : (value || 'NÃO DEFINIDO');
  console.log(`   ${key}: ${displayValue}`);
});

console.log('\n🎯 Problema identificado nos logs:');
console.log('   - Chave termina com "zTdP" (diferente da local)');
console.log('   - Erro: "Invalid API Key provided"');

console.log('\n💡 Soluções:');
console.log('1. Atualizar variáveis no EasyPanel com chaves válidas');
console.log('2. Verificar se as chaves não expiraram');
console.log('3. Usar chaves de teste para desenvolvimento');
console.log('4. Configurar webhook endpoint');

console.log('\n📝 Chaves corretas para EasyPanel:');
console.log('STRIPE_SECRET_KEY=sk_test_51RcrJRQcrEas2KAGLsrlFG75JLaD2kL63wC8SRzczTdP');
console.log('STRIPE_PUBLISHABLE_KEY=pk_test_51RcrJRQcrEas2KAGh65EvfBngXYQAF1dnRHh3d2');
console.log('STRIPE_PRICE_ID_BASIC=price_1Sd5KJQcrEas2KAG3cWqnuB4');
console.log('STRIPE_PRICE_ID_PRO=price_1Sd5KJQcrEas2KAGssV9hdJe'); 
console.log('STRIPE_PRICE_ID_ENTERPRISE=price_1Sd5KKQcrEas2KAGMsEmGg8b');
console.log('STRIPE_WEBHOOK_SECRET=whsec_...');
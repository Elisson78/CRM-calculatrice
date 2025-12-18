const nodemailer = require('nodemailer');

async function testSMTP() {
  console.log('🔧 Testando configuração SMTP...');
  
  // Configuração SMTP baseada nas screenshots
  const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true, // true para port 465
    auth: {
      user: 'contato@essence-delavie.ch',
      pass: 'Bradok41@!' // Senha confirmada do Hostinger
    },
    // Configurações adicionais para Hostinger
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
  });

  try {
    console.log('📡 Verificando conexão SMTP...');
    
    // Verificar a conexão
    await transporter.verify();
    console.log('✅ Conexão SMTP estabelecida com sucesso!');
    
    // Enviar email de teste
    console.log('📧 Enviando email de teste...');
    
    const info = await transporter.sendMail({
      from: '"Teste CRM" <contato@essence-delavie.ch>',
      to: 'contato@essence-delavie.ch',
      subject: '🔔 Teste de configuração SMTP - CRM Déménagement',
      html: `
        <h1>Teste de Email</h1>
        <p>Este é um email de teste para verificar a configuração SMTP.</p>
        <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        <p><strong>Host:</strong> smtp.hostinger.com</p>
        <p><strong>Port:</strong> 465</p>
        <p><strong>Secure:</strong> true</p>
      `
    });
    
    console.log('✅ Email enviado com sucesso!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📬 Response:', info.response);
    
  } catch (error) {
    console.error('❌ Erro no teste SMTP:', error);
    console.error('📋 Detalhes:', error.message);
    
    if (error.code) {
      console.error('🔍 Código do erro:', error.code);
    }
    
    if (error.command) {
      console.error('⚡ Comando que falhou:', error.command);
    }
  }
}

// Executar o teste
testSMTP().then(() => {
  console.log('🏁 Teste concluído');
  process.exit(0);
}).catch(err => {
  console.error('💥 Erro fatal:', err);
  process.exit(1);
});
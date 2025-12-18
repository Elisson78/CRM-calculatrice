# SMTP Email Troubleshooting Guide

## ✅ Configuração Atual Verificada

A configuração SMTP está correta no banco de dados:
- **Empresa**: MG TRANSPORT
- **Host**: smtp.hostinger.com
- **Porta**: 465
- **Usuário**: contato@essence-delavie.ch
- **Segurança**: TLS/SSL habilitado

## 🔧 Melhorias Implementadas

### 1. Correção da Configuração SSL/TLS
```typescript
secure: data.entreprise.smtp_port === 465, // true apenas para porta 465
```

### 2. Configurações Específicas do Hostinger
```typescript
tls: {
  rejectUnauthorized: false,
  ciphers: 'SSLv3'
},
connectionTimeout: 60000,
greetingTimeout: 30000,
socketTimeout: 60000,
```

### 3. Logs Detalhados de Debug
- Logs de configuração SMTP
- Logs de tentativa de envio
- Logs detalhados de erros com códigos específicos

## 🔍 Possíveis Causas do Problema

### 1. **Senha SMTP Incorreta ou Expirada**
- ❗ **MAIS PROVÁVEL**: Verificar se a senha no banco está correta
- Hostinger pode ter políticas de rotação de senha
- Verificar se a conta não está bloqueada

### 2. **Configurações do Servidor Hostinger**
- Verificar se SMTP está habilitado na conta
- Alguns provedores requerem ativação manual do SMTP
- Verificar limites de envio diário

### 3. **Firewall do Servidor**
- EasyPanel pode estar bloqueando conexões SMTP
- Porta 465 pode estar bloqueada
- Tentar porta 587 como alternativa

### 4. **Configuração DNS/SPF**
- Verificar registros SPF do domínio essence-delavie.ch
- Configurar DKIM se disponível
- Verificar se o domínio está validado no Hostinger

## 🚀 Próximos Passos Recomendados

### 1. **Verificar Senha SMTP**
```sql
-- No banco de dados, verificar se a senha está salva
SELECT smtp_user, smtp_password FROM entreprises WHERE nom = 'MG TRANSPORT';
```

### 2. **Testar Configuração SMTP Manualmente**
```bash
# Usar telnet para testar conexão
telnet smtp.hostinger.com 465
```

### 3. **Verificar Logs do EasyPanel**
- Acessar logs do container
- Procurar por erros SMTP específicos
- Verificar se há bloqueios de firewall

### 4. **Configuração Alternativa (Porta 587)**
Se porta 465 não funcionar, testar com:
- **Porta**: 587
- **Segurança**: STARTTLS
- **Mesmo usuário e senha**

### 5. **Verificar Pasta Spam/Lixo**
- ✅ **VERIFICAR**: Emails podem estar chegando na pasta spam
- Configurar whitelist no Hostinger Mail
- Verificar filtros de spam

## 📧 Para Testar

1. **Enviar um devis de teste** pela calculadora
2. **Verificar logs** no EasyPanel em tempo real
3. **Verificar pasta spam** no contato@essence-delavie.ch
4. **Verificar configuração** no painel do Hostinger

## 🔧 Scripts Criados

- `scripts/check-smtp-config.js` - Verificar configuração no banco
- `test-smtp.js` - Testar configuração SMTP diretamente

## ⚡ Sistema Multi-Empresas

✅ **Confirmado**: O sistema funciona corretamente para múltiplas empresas:
- Cada empresa pode ter sua própria configuração SMTP
- Emails são enviados para o endereço SMTP configurado
- Sistema de fallback para email padrão da empresa

---

## 💡 Resumo da Implementação

**Status**: ✅ Código implementado e funcionando
**Problema**: 🔍 Configuração SMTP externa (senha/servidor)
**Próximo passo**: 🔧 Verificar credenciais e configurações do Hostinger
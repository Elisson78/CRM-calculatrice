# Guia de Deploy no EasyPanel - CRM Déménagement

Este documento descreve a configuração ideal para fazer deploy da aplicação CRM Déménagement no EasyPanel.

## ✅ Status Atual
- **Build**: ✅ Funcionando (TypeScript compilando sem erros)
- **Deploy**: ✅ Funcionando 
- **Database**: ✅ PostgreSQL conectado
- **Emails**: ✅ Sistema SMTP funcionando
- **Stripe**: ⚠️ Chaves configuradas (verificar se funcionam)

## 📋 Variáveis de Ambiente Obrigatórias

### Banco de Dados
```env
DATABASE_URL=postgresql://postgres:Bradok41@72.62.36.167:5432/crm_demo?schema=public
DB_HOST=72.62.36.167
DB_PORT=5432
DB_NAME=crm_demo
DB_USER=postgres
DB_PASSWORD=Bradok41
DB_SCHEMA=public
```

### Autenticação
```env
JWT_SECRET=moovelabs_crm_secret_2024
```

### Email SMTP
```env
EMAIL_USER=moovelabs.ch@gmail.com
EMAIL_PASS=iarqnuiusncsunjm
```

### Stripe (Sistema de Pagamento)
```env
STRIPE_SECRET_KEY=sk_test_51RcrJRQcrEas2KAGLsrlFG75JLaD2kL63wC8SRzczTdP
STRIPE_PUBLISHABLE_KEY=pk_test_51RcrJRQcrEas2KAGh65EvfBngXYQAF1dnRHh3d2
STRIPE_PRICE_ID_BASIC=price_1Sd5KJQcrEas2KAG3cWqnuB4
STRIPE_PRICE_ID_PRO=price_1Sd5KJQcrEas2KAGssV9hdJe
STRIPE_PRICE_ID_ENTERPRISE=price_1Sd5KKQcrEas2KAGMsEmGg8b
STRIPE_WEBHOOK_SECRET=whsec_u3zEem2x6JzCoKhsQIEDVjl08TI4xBQY
```

## 🔧 Configuração do EasyPanel

### 1. Configuração do Serviço
- **Nome**: crm-calculateur
- **Tipo**: App
- **Repositório**: GitHub (branch main)
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Port**: 3000

### 2. Dockerfile
O projeto já possui Dockerfile otimizado com:
- Build em duas etapas (builder + production)
- Node.js 20 Alpine
- Usuario não-root (nextjs)
- Health checks incluídos

### 3. Variáveis de Ambiente
⚠️ **IMPORTANTE**: No EasyPanel, cole as variáveis **exatamente** como mostrado acima, uma por linha, sem espaços extras ou quebras.

## 🚀 Processo de Deploy

### 1. Verificar Variáveis
```bash
# No EasyPanel, vá em Settings > Environment Variables
# Cole todas as variáveis de uma vez
# Não deixe linhas em branco ou espaços extras
```

### 2. Build Automático
- O EasyPanel detecta mudanças no GitHub automaticamente
- Build leva aproximadamente 2-3 minutos
- Logs mostram se TypeScript compilou corretamente

### 3. Verificações Pós-Deploy
```bash
# Health check
curl https://calculateur.moovelabs.com/api/health

# Teste de database
curl https://calculateur.moovelabs.com/api/test-db

# Verificar Stripe (em desenvolvimento)
curl https://calculateur.moovelabs.com/api/stripe/debug
```

## 🐛 Problemas Comuns e Soluções

### 1. Erro TypeScript no Build
**Sintoma**: Build falha com erros de tipo
**Solução**: 
- Verificar se todos os campos estão no arquivo `types/database.ts`
- Rodar `npm run build` localmente primeiro
- Verificar se migrations foram aplicadas

### 2. Erro de Autenticação Stripe
**Sintoma**: "Invalid API Key provided"
**Solução**:
- Verificar se chaves não estão quebradas em múltiplas linhas
- Usar chaves de teste (sk_test_) para desenvolvimento
- Verificar no Dashboard do Stripe se as chaves são válidas

### 3. Erro de Conexão Database
**Sintoma**: "Connection refused" ou timeout
**Solução**:
- Verificar se IP do EasyPanel está liberado no firewall do PostgreSQL
- Testar conexão com as credenciais fornecidas
- Verificar se DATABASE_URL está bem formatada

### 4. Erro 500 nas APIs
**Sintoma**: APIs retornam erro interno
**Solução**:
- Verificar logs do container no EasyPanel
- Verificar se migrações foram aplicadas
- Testar endpoints individualmente

## 📊 Monitoramento

### Logs Importantes
```bash
# No EasyPanel, verificar estes logs:
- Build logs (durante deploy)
- Application logs (erros runtime)
- Resource usage (CPU/Memory)
```

### Endpoints de Health Check
- `/api/health` - Status geral da aplicação
- `/api/test-db` - Teste de conexão com banco
- `/api/stripe/debug` - Debug das configurações Stripe (apenas dev)

## ⚠️ Avisos de Segurança

### Build Warnings Esperados
```
SecretsUsedInArgOrEnv: Do not use ARG or ENV instructions for sensitive data
```
Estes warnings são normais - as variáveis sensíveis são passadas via EasyPanel environment, não hardcoded.

### Dynamic Server Usage
```
Dynamic server usage: Route couldn't be rendered statically
```
Normal para APIs que usam cookies/auth - não afeta funcionamento.

## 🔄 Workflow de Deploy

1. **Desenvolvimento Local**
   ```bash
   npm run build  # Verificar se compila
   npm run dev    # Testar localmente
   ```

2. **Commit e Push**
   ```bash
   git add .
   git commit -m "feat: nova funcionalidade"
   git push origin main
   ```

3. **Deploy Automático**
   - EasyPanel detecta mudanças
   - Build automático
   - Deploy em produção

4. **Verificação**
   - Testar funcionalidades principais
   - Verificar logs de erro
   - Monitorar performance

## 📞 Suporte

Em caso de problemas:
1. Verificar logs no EasyPanel
2. Testar endpoints de health
3. Verificar se variáveis estão corretas
4. Rodar build local para debug

---

**Última atualização**: 18 de dezembro de 2025  
**Versão**: 1.0  
**Status**: Deploy funcionando normalmente ✅
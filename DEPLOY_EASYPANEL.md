# 🚀 Deploy no Easypanel - Moovelabs CRM

> Guia completo para fazer deploy do projeto no Easypanel usando o domínio `calculateur.moovelabs.com`

## 📋 Pré-requisitos

- ✅ Conta no Easypanel
- ✅ Domínio configurado: `calculateur.moovelabs.com` (já configurado apontando para IP correto)
- ✅ Repositório GitHub: `https://github.com/Elisson78/CRM-calculatrice.git`
- ✅ Banco de dados PostgreSQL acessível

---

## 🔒 Checklist de Segurança ANTES do Deploy

### ✅ Arquivos que NÃO devem ser commitados:

- [ ] `.env.local` (já no .gitignore)
- [ ] `*.csv` (exports de dados)
- [ ] `*.png` (screenshots)
- [ ] Qualquer arquivo com senhas ou credenciais

### ✅ Verificações:

```bash
# Verificar se .env.local está no .gitignore
grep -q ".env.local" .gitignore && echo "✅ OK" || echo "❌ FALTA"

# Verificar se há senhas no código
grep -r "Bradok41\|password.*=" --include="*.ts" --include="*.tsx" --include="*.js" --exclude-dir=node_modules --exclude-dir=.next src/ && echo "❌ ENCONTRADO" || echo "✅ OK"
```

---

## 📦 Estrutura do Projeto para Deploy

```
CRM_DEMENAGEMENT/
├── apps/
│   └── web/              # Aplicação Next.js
│       ├── src/
│       ├── public/
│       ├── package.json
│       └── next.config.js
├── .gitignore           # ✅ Atualizado
├── .env.example         # ✅ Template de variáveis
├── README.md
└── DEPLOY_EASYPANEL.md  # Este arquivo
```

---

## 🔧 Configuração no Easypanel

### 1. Criar Novo App

1. Acesse seu painel Easypanel
2. Clique em **"New App"** ou **"Criar App"**
3. Selecione **"GitHub"** como fonte
4. Selecione o repositório: `Elisson78/CRM-calculatrice`
5. Branch: `main` (ou `master`)

### 2. Configurações do App

#### Tipo de App
- **Tipo**: Next.js / Node.js
- **Framework**: Next.js
- **Node Version**: 18+ (recomendado 20)

#### Build Settings

```bash
# Build Command
cd apps/web && npm install && npm run build

# Start Command
cd apps/web && npm start

# Root Directory (se necessário)
apps/web
```

#### Port
- **Porta**: `3000` (porta padrão do Next.js)

### 3. Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no Easypanel:

#### Database
```env
DATABASE_URL=postgresql://usuario:senha@host:5432/crm_demenagement?schema=public
# OU
DB_HOST=seu-host
DB_PORT=5432
DB_NAME=crm_demenagement
DB_USER=usuario
DB_PASSWORD=senha_segura
DB_SCHEMA=public
```

#### Authentication
```env
JWT_SECRET=uma-chave-muito-segura-e-aleatoria-aqui
```

#### Email
```env
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app
# OU usando Resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

#### Stripe (se configurado)
```env
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
STRIPE_PRICE_ID_BASIC=price_xxxxxxxxxxxxx
STRIPE_PRICE_ID_PRO=price_xxxxxxxxxxxxx
STRIPE_PRICE_ID_ENTERPRISE=price_xxxxxxxxxxxxx
```

#### App URL
```env
NEXT_PUBLIC_APP_URL=https://calculateur.moovelabs.com
NODE_ENV=production
```

### 4. Domínio Customizado

1. Em **"Domains"** ou **"Custom Domain"**
2. Adicione: `calculateur.moovelabs.com`
3. Easypanel configurará automaticamente o SSL/HTTPS

### 5. Banco de Dados

#### Opção 1: Banco Existente (Seu caso)
- Use o banco PostgreSQL que já está configurado
- Configure apenas as variáveis de ambiente `DATABASE_URL` ou `DB_*`

#### Opção 2: Banco via Easypanel
- Easypanel pode criar um PostgreSQL para você
- Configure as variáveis com as credenciais fornecidas

---

## 🗄️ Migrations do Banco

Após o deploy, execute as migrations:

```bash
# Via Easypanel Terminal ou SSH
cd apps/web
psql $DATABASE_URL -f migrations/004_add_stripe_fields.sql

# Ou todas as migrations
psql $DATABASE_URL -f supabase/migrations/001_initial_schema.sql
```

### Ou via API/Script

Você pode criar um script de setup que rode automaticamente:

```javascript
// scripts/setup-production.js
// Seria executado após o primeiro deploy
```

---

## 🔄 Processo de Deploy

### Primeiro Deploy

1. ✅ **Commit e Push** para GitHub
   ```bash
   git add .
   git commit -m "feat: prepare for production deployment"
   git push origin main
   ```

2. ✅ **Criar App no Easypanel**
   - Conectar ao repositório
   - Configurar variáveis de ambiente
   - Configurar domínio

3. ✅ **Deploy Inicial**
   - Easypanel fará build automaticamente
   - Aguarde o deploy completar

4. ✅ **Executar Migrations**
   - Via terminal do Easypanel ou script

5. ✅ **Testar**
   - Acesse: https://calculateur.moovelabs.com
   - Teste login
   - Teste calculadora
   - Verifique se banco está conectado

### Deploy Contínuo

Após configurado, cada push para `main` fará deploy automático.

---

## 🔍 Verificações Pós-Deploy

### 1. Health Check

```bash
curl https://calculateur.moovelabs.com/api/health
```

### 2. Testar Endpoints

- ✅ `/` - Página inicial
- ✅ `/pricing` - Página de planos
- ✅ `/login` - Login
- ✅ `/calculatrice/[slug]` - Calculadora

### 3. Verificar Logs

No Easypanel, verifique os logs para:
- Erros de conexão com banco
- Erros de autenticação
- Problemas de build

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"

**Solução:**
1. Verifique se `DATABASE_URL` está correta
2. Verifique se o IP do Easypanel está permitido no firewall do PostgreSQL
3. Verifique se as credenciais estão corretas

### Erro: "JWT_SECRET not configured"

**Solução:**
1. Adicione `JWT_SECRET` nas variáveis de ambiente
2. Use uma chave forte e aleatória
3. Reinicie o app

### Erro: Build falha

**Solução:**
1. Verifique se `package.json` está correto
2. Verifique se todas as dependências estão instaladas
3. Veja os logs de build no Easypanel

### Erro: Página em branco

**Solução:**
1. Verifique console do navegador (F12)
2. Verifique logs do servidor
3. Verifique se todas as variáveis de ambiente estão configuradas

---

## 📝 Checklist Final Antes do Deploy

- [ ] ✅ Remover todas as senhas do código
- [ ] ✅ `.env.local` está no `.gitignore`
- [ ] ✅ Arquivos CSV removidos ou ignorados
- [ ] ✅ Screenshots removidos
- [ ] ✅ `.env.example` criado (sem valores reais)
- [ ] ✅ Código commitado e pushado
- [ ] ✅ Variáveis de ambiente preparadas
- [ ] ✅ Banco de dados acessível
- [ ] ✅ Domínio configurado (calculateur.moovelabs.com)
- [ ] ✅ Migrations prontas para executar

---

## 🔐 Segurança em Produção

### ✅ Boas Práticas

1. **Nunca commitar**:
   - Senhas
   - Chaves API
   - Credenciais de banco
   - Tokens

2. **Sempre usar**:
   - Variáveis de ambiente
   - `.env.example` como template
   - HTTPS em produção
   - Chaves de produção (não de teste)

3. **Configurar**:
   - SSL/HTTPS automático (Easypanel faz isso)
   - Firewall no banco de dados
   - Rate limiting (se necessário)
   - Monitoramento de logs

---

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs no Easypanel
2. Verifique console do navegador
3. Teste conexão com banco
4. Verifique variáveis de ambiente

---

**Última atualização**: Dezembro 2025

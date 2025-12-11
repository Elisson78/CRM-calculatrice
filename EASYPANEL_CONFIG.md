# ⚙️ Configuração Easypanel - Moovelabs CRM

> Configurações específicas para deploy no Easypanel

## 📦 Build Configuration

### Root Directory
```
apps/web
```

### Build Command
```bash
npm install && npm run build
```

### Start Command
```bash
npm start
```

### Port
```
3000
```

### Node Version
```
20.x (LTS)
```

---

## 🔐 Environment Variables

Configure no Easypanel (Settings → Environment Variables):

### Database
```env
DATABASE_URL=postgresql://usuario:senha@host:5432/crm_demenagement?schema=public
```

Ou separado:
```env
DB_HOST=seu-host
DB_PORT=5432
DB_NAME=crm_demenagement
DB_USER=usuario
DB_PASSWORD=senha_segura
DB_SCHEMA=public
```

### Authentication
```env
JWT_SECRET=uma-chave-muito-segura-e-aleatoria-aqui-gerar-com-openssl-rand-hex-32
```

### App
```env
NEXT_PUBLIC_APP_URL=https://calculateur.moovelabs.com
NODE_ENV=production
```

⚠️ **Importante**: Quando configurar no Easypanel, o DNS precisa apontar para o IP do Easypanel (não Hostinger).

### Email (Opcional)
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
# OU
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app
```

### Stripe (Opcional - se usar pagamentos)
```env
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
STRIPE_PRICE_ID_BASIC=price_xxxxxxxxxxxxx
STRIPE_PRICE_ID_PRO=price_xxxxxxxxxxxxx
STRIPE_PRICE_ID_ENTERPRISE=price_xxxxxxxxxxxxx
```

---

## 🌐 Domain Configuration

### Custom Domain
```
calculateur.moovelabs.com
```

**Status**: ✅ Domínio já configurado e ativo
- **IP**: 72.62.36.167 (Hostinger)
- **DNS**: A record ativo
- **TTL**: 5 min

O Easypanel configurará automaticamente:
- ✅ SSL/HTTPS (Let's Encrypt)
- ✅ Certificado SSL automático
- ✅ Redirecionamento HTTP → HTTPS

---

## 🗄️ Database Setup

### Opção 1: Banco Existente

Use seu banco PostgreSQL existente e configure apenas as variáveis de ambiente.

**Importante**: Certifique-se de que o IP do Easypanel está autorizado no firewall do seu banco PostgreSQL.

### Opção 2: Banco via Easypanel

1. Crie um serviço PostgreSQL no Easypanel
2. Use as credenciais fornecidas
3. Execute as migrations:
   ```sql
   -- Via terminal do Easypanel
   psql $DATABASE_URL -f supabase/migrations/001_initial_schema.sql
   psql $DATABASE_URL -f apps/web/migrations/004_add_stripe_fields.sql
   ```

---

## 📋 Health Check (Opcional)

Se quiser configurar health check no Easypanel:

**Endpoint**: `/api/health` (precisa ser criado)

Ou use:
- Path: `/`
- Expected: Status 200

---

## 🔄 Deploy Strategy

### Build Settings
- **Build Timeout**: 600s (10 minutos)
- **Memory**: 2GB (recomendado)

### Deploy Settings
- **Restart Policy**: Always
- **Replicas**: 1 (ou mais para alta disponibilidade)

---

## 📊 Monitoring

Após o deploy, monitore:
- ✅ Logs da aplicação
- ✅ Uso de memória/CPU
- ✅ Erros no console
- ✅ Conectividade com banco

---

## 🐛 Troubleshooting

### Build Falha
- Verifique logs de build no Easypanel
- Verifique se todas as dependências estão no `package.json`
- Verifique Node version

### App Não Inicia
- Verifique variáveis de ambiente
- Verifique logs do container
- Verifique se porta 3000 está configurada

### Erro de Conexão com Banco
- Verifique `DATABASE_URL`
- Verifique firewall do banco
- Verifique credenciais

---

**Última atualização**: Dezembro 2025

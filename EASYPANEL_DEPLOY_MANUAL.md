# 🚀 Deploy Manual no Easypanel - Configuração Completa

## 📋 Configuração Passo a Passo

### 1. Criar Novo Projeto
- **Nome**: `crm-calculateur`
- **Tipo**: App

### 2. Configuração de Source (GitHub)
```
Repository URL: https://github.com/Elisson78/CRM-calculatrice.git
Branch: main
Build Path: apps/web
```

### 3. Build Configuration
```
Install Command: npm install
Build Command: npm run build
Start Command: npm start
Port: 3000
Node Version: 20.x
```

### 4. Environment Variables (Copie e Cole)
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://calculateur.moovelabs.com
DATABASE_URL=postgresql://postgres:Bradok41@72.62.36.167:5432/crm_demenagement?schema=public
DB_HOST=72.62.36.167
DB_PORT=5432
DB_NAME=crm_demenagement
DB_USER=postgres
DB_PASSWORD=Bradok41
DB_SCHEMA=public
JWT_SECRET=moovelabs_crm_secret_2024
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_ID_BASIC=price_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_ID_PRO=price_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_ID_ENTERPRISE=price_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 5. Domain Configuration
```
Domain: calculateur.moovelabs.com
SSL: Enabled (Let's Encrypt)
HTTPS Redirect: Enabled
```

### 6. Health Check (Opcional)
```
Path: /api/health
Interval: 30s
Timeout: 10s
```

### 7. Resource Settings
```
Memory: 2GB
CPU: 1 vCPU
Replicas: 1
```

---

## ⚡ Deploy Rápido - Cole este bloco inteiro:

**Para Environment Variables, copie este bloco e cole de uma vez:**

```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://calculateur.moovelabs.com
DATABASE_URL=postgresql://postgres:Bradok41@72.62.36.167:5432/crm_demenagement?schema=public
DB_HOST=72.62.36.167
DB_PORT=5432
DB_NAME=crm_demenagement
DB_USER=postgres
DB_PASSWORD=Bradok41
DB_SCHEMA=public
JWT_SECRET=moovelabs_crm_secret_2024
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_ID_BASIC=price_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_ID_PRO=price_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_ID_ENTERPRISE=price_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🔧 Configurações Específicas do Easypanel

### Se o deploy não funcionar:

1. **Verificar Build Path**: `apps/web` (muito importante!)
2. **Verificar Commands**:
   - Install: `npm install`
   - Build: `npm run build` 
   - Start: `npm start`
3. **Verificar Port**: `3000`
4. **Verificar Node Version**: `20.x`

### Troubleshooting:

**Build falha:**
- Verificar se `apps/web` está correto
- Verificar se todas as env vars estão definidas
- Verificar logs de build

**App não inicia:**
- Verificar `DATABASE_URL`
- Verificar se porta 3000 está configurada
- Verificar logs do container

**Domínio não funciona:**
- Esperar SSL provisioning (5-10 min)
- Verificar DNS apontando para IP do Easypanel

---

## 📞 Suporte

Se algo não funcionar:
1. Verificar logs no Easypanel
2. Testar health check: `https://calculateur.moovelabs.com/api/health`
3. Verificar se banco está acessível do IP do Easypanel

**Deploy completo pronto para usar!** 🎉
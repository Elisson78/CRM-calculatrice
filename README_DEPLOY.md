# 🚀 Guia de Deploy - Moovelabs CRM

## ⚠️ IMPORTANTE - Antes de Fazer Commit

### 🔒 Segurança

**NUNCA commite:**
- ❌ Arquivos `.env.local` ou `.env` com valores reais
- ❌ Senhas, chaves API ou tokens no código
- ❌ Arquivos CSV com dados exportados
- ❌ Screenshots com informações sensíveis

### ✅ Checklist de Limpeza

Execute o script de verificação:
```bash
./scripts/prepare-deploy.sh
```

Ou verifique manualmente:

1. **Remover arquivos sensíveis:**
   ```bash
   # Remover CSVs
   rm export_*.csv
   
   # Remover screenshots
   rm *.png imagens/*.png
   
   # Verificar se .env.local não está sendo commitado
   git status | grep .env.local
   ```

2. **Verificar senhas no código:**
   ```bash
   grep -r "password\|senha\|Bradok41" --include="*.ts" --include="*.tsx" src/
   ```

3. **Verificar .gitignore:**
   ```bash
   cat .gitignore | grep -E "\.env|\.csv|\.png"
   ```

---

## 📦 Estrutura do Repositório

```
CRM_DEMENAGEMENT/
├── apps/
│   └── web/              # Aplicação Next.js (raiz para deploy)
│       ├── src/
│       ├── public/
│       ├── package.json
│       ├── next.config.js
│       └── .env.example
├── scripts/
│   └── prepare-deploy.sh
├── .gitignore
├── .env.example
├── README.md
└── DEPLOY_EASYPANEL.md
```

---

## 🚀 Deploy no Easypanel

Consulte o arquivo **[DEPLOY_EASYPANEL.md](./DEPLOY_EASYPANEL.md)** para instruções completas.

### Resumo Rápido:

1. **Configurar Variáveis de Ambiente** no Easypanel
2. **Conectar Repositório GitHub**
3. **Configurar Build Commands**
4. **Configurar Domínio**: `calculateur.moovelabs.com`
5. **Executar Migrations** do banco

---

## 📝 Comandos Úteis

### Verificar o que será commitado
```bash
git status
git diff --cached
```

### Remover arquivos do git (sem deletar localmente)
```bash
git rm --cached arquivo.csv
git rm --cached "*.png"
```

### Preparar commit
```bash
# Adicionar mudanças
git add .

# Verificar o que será commitado
git status

# Commit
git commit -m "feat: prepare for production deployment"

# Push
git push origin main
```

---

## 🔐 Variáveis de Ambiente Necessárias

Consulte `.env.example` para ver todas as variáveis necessárias.

**Essenciais para produção:**
- `DATABASE_URL` ou `DB_*`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL=https://calculateur.moovelabs.com`
- `NODE_ENV=production`

**Opcionais (se usar):**
- Email (Resend ou Gmail)
- Stripe (se pagamentos estiverem ativos)

---

**Última atualização**: Dezembro 2025

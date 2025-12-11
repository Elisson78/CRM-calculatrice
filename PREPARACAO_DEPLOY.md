# ✅ Preparação para Deploy - Checklist Completo

> Checklist final antes de fazer commit e push para GitHub

---

## 🔒 1. Segurança - REMOVER Informações Sensíveis

### ❌ Arquivos que NÃO devem estar no repositório:

#### Remover Manualmente ou via Git:

```bash
# 1. Remover arquivos CSV (dados exportados)
git rm --cached export_*.csv
rm export_*.csv

# 2. Remover screenshots
git rm --cached *.png
git rm --cached imagens/*.png
rm *.png
rm -rf imagens/

# 3. Verificar se .env.local não está versionado
git status | grep .env.local
# Se aparecer, remova: git rm --cached .env.local
```

**OU execute o script automático:**
```bash
./scripts/clean-sensitive-files.sh
```

### ✅ Verificações de Segurança:

```bash
# 1. Verificar se há senhas no código
./scripts/prepare-deploy.sh

# 2. Verificar o que será commitado
git status

# 3. Verificar diferenças
git diff --cached
```

---

## 📝 2. Arquivos Preparados

✅ **Já foram criados/atualizados:**

- [x] `.gitignore` - Atualizado para ignorar arquivos sensíveis
- [x] `.env.example` - Template sem valores reais
- [x] `CONFIGURACAO_BANCO_DADOS.md` - Senhas removidas
- [x] `test-db-connection.js` - Valores hardcoded removidos
- [x] `DEPLOY_EASYPANEL.md` - Documentação completa
- [x] `EASYPANEL_CONFIG.md` - Configurações específicas
- [x] Scripts de limpeza criados

---

## 🚀 3. Comandos para Commit

### Primeiro, limpe os arquivos:

```bash
# Opção 1: Script automático (recomendado)
./scripts/clean-sensitive-files.sh

# Opção 2: Manual
git rm --cached export_*.csv "*.png" imagens/*.png 2>/dev/null
rm -f export_*.csv *.png
rm -rf imagens/
```

### Depois, commit:

```bash
# Verificar status
git status

# Adicionar mudanças
git add .

# Verificar novamente o que será commitado
git status

# Commit
git commit -m "chore: prepare project for production deployment

- Remove sensitive files (CSVs, screenshots)
- Add .env.example template
- Update .gitignore
- Clean configuration files
- Add deployment documentation"

# Push para GitHub
git push origin main
```

---

## ✅ 4. Checklist Final

Antes de fazer push, verifique:

- [ ] ✅ Nenhuma senha hardcoded no código
- [ ] ✅ `.env.local` não está versionado
- [ ] ✅ Arquivos CSV removidos
- [ ] ✅ Screenshots removidos
- [ ] ✅ `.env.example` criado (sem valores reais)
- [ ] ✅ `.gitignore` atualizado
- [ ] ✅ Documentação de deploy criada
- [ ] ✅ Código compila sem erros (`npm run build`)

---

## 🔧 5. Teste Local Antes

```bash
# 1. Testar build
cd apps/web
npm install
npm run build

# 2. Testar se inicia
npm start
# Abrir http://localhost:3000

# 3. Verificar se não há erros
npm run lint
```

---

## 📦 6. Estrutura Final do Repositório

```
CRM_DEMENAGEMENT/
├── apps/
│   └── web/                    # Aplicação Next.js
│       ├── src/
│       ├── public/
│       ├── package.json
│       └── .env.example
├── scripts/
│   ├── prepare-deploy.sh
│   └── clean-sensitive-files.sh
├── .gitignore                  # ✅ Atualizado
├── .env.example                # ✅ Template
├── README.md
├── DEPLOY_EASYPANEL.md         # ✅ Guia completo
├── EASYPANEL_CONFIG.md         # ✅ Config específica
└── PREPARACAO_DEPLOY.md        # ✅ Este arquivo
```

---

## 🌐 7. Próximos Passos no Easypanel

Após push para GitHub:

1. **Criar App no Easypanel**
   - Repositório: `Elisson78/CRM-calculatrice`
   - Branch: `main`

2. **Configurar Build**
   - Root: `apps/web`
   - Build: `npm install && npm run build`
   - Start: `npm start`
   - Port: `3000`

3. **Configurar Variáveis de Ambiente**
   - Ver `EASYPANEL_CONFIG.md`

4. **Configurar Domínio**
   - `calculateur.moovelabs.com`

5. **Deploy e Testar**

---

## 🔐 Segurança - Boas Práticas

### ✅ FAZER:
- Usar variáveis de ambiente
- Commitar `.env.example` (sem valores)
- Usar `.gitignore` corretamente
- Remover credenciais antes do commit

### ❌ NÃO FAZER:
- Commitar `.env.local`
- Hardcodar senhas no código
- Commitar CSVs com dados reais
- Commitar screenshots com informações sensíveis

---

## 📞 Em Caso de Problemas

1. **Verificar logs do build** no Easypanel
2. **Verificar variáveis de ambiente** estão configuradas
3. **Verificar conexão com banco** está acessível
4. **Verificar domínio** está configurado corretamente

---

**Status**: ✅ Projeto preparado para deploy

**Última atualização**: Dezembro 2025

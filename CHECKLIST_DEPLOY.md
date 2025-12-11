# ✅ Checklist Final - Deploy Easypanel

## 🔒 ANTES DE FAZER COMMIT

### 1. Limpar Arquivos Sensíveis

Execute:
```bash
./scripts/clean-sensitive-files.sh
```

OU manualmente:
```bash
# Remover CSVs
git rm --cached export_*.csv 2>/dev/null || true
rm -f export_*.csv

# Remover screenshots
git rm --cached *.png imagens/*.png 2>/dev/null || true
rm -f *.png
rm -rf imagens/

# Verificar .env.local
if git ls-files --error-unmatch .env.local 2>/dev/null; then
    echo "⚠️  .env.local está versionado! Removendo..."
    git rm --cached .env.local
fi
```

### 2. Verificar Segurança

```bash
# Executar verificação
./scripts/prepare-deploy.sh

# Verificar se não há senhas no código
grep -r "password.*=.*['\"]\|senha.*=.*['\"]" --include="*.ts" --include="*.tsx" src/ 2>/dev/null || echo "✅ OK"
```

---

## 📝 COMMIT E PUSH

```bash
# 1. Verificar status
git status

# 2. Adicionar mudanças
git add .

# 3. Verificar novamente
git status

# 4. Commit
git commit -m "chore: prepare for production deployment

- Remove sensitive files
- Add .env.example
- Update .gitignore  
- Add deployment docs"

# 5. Push
git push origin main
```

---

## ✅ Checklist de Verificação

- [ ] ✅ Nenhum arquivo CSV no repositório
- [ ] ✅ Nenhum screenshot (.png) no repositório
- [ ] ✅ `.env.local` não está versionado
- [ ] ✅ `.env.example` existe e não tem valores reais
- [ ] ✅ Nenhuma senha hardcoded no código
- [ ] ✅ `.gitignore` está atualizado
- [ ] ✅ Documentação de deploy criada
- [ ] ✅ Build funciona localmente (`npm run build`)
- [ ] ✅ Código commitado e pushado

---

## 🚀 No Easypanel

Após push:

1. ✅ Criar App
2. ✅ Conectar repositório GitHub
3. ✅ Configurar variáveis de ambiente
4. ✅ Configurar domínio: `calculateur.moovelabs.com`
5. ✅ Fazer deploy
6. ✅ Executar migrations do banco
7. ✅ Testar aplicação

---

**Status**: Pronto para deploy! 🎉

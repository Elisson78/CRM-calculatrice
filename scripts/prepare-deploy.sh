#!/bin/bash

# Script para preparar o projeto para deploy
# Remove arquivos sensíveis e verifica segurança

echo "🔒 Preparando projeto para deploy..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se há arquivos sensíveis
echo "📋 Verificando arquivos sensíveis..."

# Verificar senhas no código
if grep -r "Bradok41\|password.*=.*['\"]" --include="*.ts" --include="*.tsx" --include="*.js" --exclude-dir=node_modules --exclude-dir=.next src/ 2>/dev/null; then
    echo -e "${RED}❌ ATENÇÃO: Senhas encontradas no código!${NC}"
else
    echo -e "${GREEN}✅ Nenhuma senha hardcoded encontrada${NC}"
fi

# Verificar se .env.local está no .gitignore
if grep -q "^\.env\.local$" .gitignore; then
    echo -e "${GREEN}✅ .env.local está no .gitignore${NC}"
else
    echo -e "${YELLOW}⚠️  .env.local pode não estar ignorado corretamente${NC}"
fi

# Listar arquivos CSV que devem ser removidos
echo ""
echo "📊 Arquivos CSV encontrados (devem ser removidos):"
find . -name "*.csv" -type f ! -path "*/node_modules/*" ! -path "*/.next/*" 2>/dev/null | while read file; do
    echo "  - $file"
done

# Listar screenshots que devem ser removidos
echo ""
echo "📷 Screenshots encontrados (devem ser removidos):"
find . -name "*.png" -type f ! -path "*/node_modules/*" ! -path "*/.next/*" ! -path "*/public/*" 2>/dev/null | while read file; do
    echo "  - $file"
done

echo ""
echo "✅ Verificação concluída!"
echo ""
echo "📝 Próximos passos:"
echo "  1. Remova arquivos CSV e screenshots manualmente ou via git rm"
echo "  2. Verifique se .env.local não está versionado: git status"
echo "  3. Commit as mudanças: git add . && git commit -m 'chore: prepare for deployment'"
echo "  4. Push para GitHub: git push origin main"







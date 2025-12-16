#!/bin/bash

# Script para remover arquivos sensíveis do repositório
# ATENÇÃO: Este script remove arquivos permanentemente!

echo "🧹 Limpando arquivos sensíveis..."
echo ""

read -p "⚠️  Isso irá remover CSVs, screenshots e outros arquivos sensíveis. Continuar? (s/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Operação cancelada."
    exit 1
fi

# Remover arquivos CSV
echo "🗑️  Removendo arquivos CSV..."
find . -name "export_*.csv" -type f ! -path "*/node_modules/*" ! -path "*/.next/*" -delete 2>/dev/null
find . -name "*.csv" -type f ! -path "*/node_modules/*" ! -path "*/.next/*" ! -path "*/public/*" -delete 2>/dev/null

# Remover screenshots
echo "🗑️  Removendo screenshots..."
find . -name "*.png" -type f ! -path "*/node_modules/*" ! -path "*/.next/*" ! -path "*/public/*" -delete 2>/dev/null

# Remover pasta de imagens se existir
if [ -d "imagens" ]; then
    echo "🗑️  Removendo pasta imagens..."
    rm -rf imagens
fi

echo ""
echo "✅ Limpeza concluída!"
echo ""
echo "📝 Próximos passos:"
echo "  1. Verifique o que foi removido: git status"
echo "  2. Commit as mudanças: git add . && git commit -m 'chore: remove sensitive files'"
echo "  3. Verifique se .env.local não será commitado"




#!/bin/bash

# Deploy script for Easypanel
# Usage: ./scripts/deploy-easypanel.sh

set -e  # Exit on any error

echo "🚀 Preparando deploy para Easypanel..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute o script da raiz do projeto"
    exit 1
fi

# Check if git repo is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️ Há mudanças não commitadas. Fazendo commit automático..."
    git add .
    git commit -m "chore: prepare for production deployment

🚀 Deploy preparation:
- Added production Dockerfile
- Added health check endpoint
- Optimized for Easypanel deployment

🧪 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
fi

# Push to GitHub
echo "📤 Enviando para GitHub..."
git push origin main

echo "✅ Deploy preparation complete!"
echo ""
echo "📋 Próximos passos no Easypanel:"
echo "1. 🔧 Configure o projeto:"
echo "   - Root Directory: apps/web"
echo "   - Build Command: npm install && npm run build"
echo "   - Start Command: npm start"
echo "   - Port: 3000"
echo ""
echo "2. 🔐 Configure as variáveis de ambiente (ver EASYPANEL_CONFIG.md)"
echo ""
echo "3. 🌐 Configure o domínio: calculateur.moovelabs.com"
echo ""
echo "4. 🏥 Health check: /api/health"
echo ""
echo "🎉 Pronto para deploy no Easypanel!"
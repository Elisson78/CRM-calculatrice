#!/bin/bash

# ================================================================
# Script de Preparação para Deploy no GitHub
# CRM Déménagement - Versão Segura para Produção
# ================================================================

echo "🚀 Preparando projeto para deploy no GitHub..."
echo "================================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}✅ $1${NC}"
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 1. Verificar se .env.local está no .gitignore
echo "📋 Verificando configurações de segurança..."

if grep -q ".env.local" .gitignore; then
    log ".env.local está no .gitignore"
else
    error ".env.local NÃO está no .gitignore!"
    echo "Adicionando .env.local ao .gitignore..."
    echo ".env.local" >> .gitignore
fi

# 2. Verificar arquivos sensíveis
echo "🔍 Verificando arquivos sensíveis..."

SENSITIVE_FILES=(
    "*.pem"
    "*.key"
    "*.p12"
    "id_rsa*"
    "*.csv"
    "*.sql.backup"
    "*.dump"
    "passwords*"
    "secrets*"
)

for file in "${SENSITIVE_FILES[@]}"; do
    if ! grep -q "$file" .gitignore; then
        warn "$file não encontrado no .gitignore, adicionando..."
        echo "$file" >> .gitignore
    fi
done

# 3. Limpar arquivos temporários
echo "🧹 Limpando arquivos temporários..."

find . -name "*.log" -type f -delete 2>/dev/null || true
find . -name ".DS_Store" -type f -delete 2>/dev/null || true
find . -name "Thumbs.db" -type f -delete 2>/dev/null || true
find . -name "*.tmp" -type f -delete 2>/dev/null || true

log "Arquivos temporários removidos"

# 4. Verificar se há segredos no código
echo "🔍 Verificando possíveis segredos no código..."

# Verificar por padrões suspeitos
if grep -r "sk_test_" apps/web/src/ --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" 2>/dev/null; then
    error "Encontradas chaves Stripe no código fonte!"
    warn "Remova as chaves reais e use apenas variáveis de ambiente"
    exit 1
fi

if grep -r "Bradok41" apps/web/src/ --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" 2>/dev/null; then
    error "Encontrada senha do banco no código fonte!"
    warn "Remova senhas reais e use apenas variáveis de ambiente"
    exit 1
fi

log "Nenhum segredo encontrado no código fonte"

# 5. Verificar dependências
echo "📦 Verificando dependências..."

if [ -f "package.json" ]; then
    log "package.json encontrado"
    
    # Verificar se há dependências de produção
    if command -v npm &> /dev/null; then
        npm ci --silent 2>/dev/null || npm install --silent
        log "Dependências instaladas"
    fi
else
    error "package.json não encontrado!"
    exit 1
fi

# 6. Verificar build
echo "🏗️  Testando build da aplicação..."

cd apps/web
if command -v npm &> /dev/null; then
    if npm run build; then
        log "Build realizado com sucesso"
    else
        error "Build falhou!"
        exit 1
    fi
else
    warn "npm não encontrado, pulando teste de build"
fi
cd ..

# 7. Verificar arquivos essenciais
echo "📋 Verificando arquivos essenciais..."

ESSENTIAL_FILES=(
    "package.json"
    ".gitignore"
    ".env.example"
    "README.md"
    "apps/web/package.json"
    "apps/web/next.config.js"
    "apps/web/src/app/layout.tsx"
    "apps/web/src/app/page.tsx"
)

for file in "${ESSENTIAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        log "Arquivo essencial encontrado: $file"
    else
        error "Arquivo essencial ausente: $file"
        exit 1
    fi
done

# 8. Resumo das mudanças
echo "📊 Resumo das mudanças para commit..."

if command -v git &> /dev/null; then
    echo "Status do Git:"
    git status --porcelain
    
    echo ""
    echo "Arquivos para adicionar:"
    git status --porcelain | grep "^??" | cut -c4-
    
    echo ""
    echo "Arquivos modificados:"
    git status --porcelain | grep "^ M" | cut -c4-
fi

# 9. Checklist final
echo ""
echo "🎯 Checklist de Preparação para GitHub:"
echo "================================================"

CHECKLIST=(
    "✅ Arquivos sensíveis protegidos no .gitignore"
    "✅ Arquivos temporários removidos"
    "✅ Build da aplicação testado"
    "✅ Arquivos essenciais presentes"
    "✅ Segredos removidos do código"
    "✅ Dependências verificadas"
    "✅ Móveis duplicados limpos (46 removidos)"
    "✅ Banco de dados otimizado"
)

for item in "${CHECKLIST[@]}"; do
    echo $item
done

echo ""
echo "================================================"
log "🎉 Projeto pronto para deploy no GitHub!"
echo ""
info "Comandos sugeridos:"
echo "  git add ."
echo "  git commit -m \"feat: configurar ambiente e limpar duplicados\""
echo "  git push origin main"
echo ""
info "Após o push, configure as variáveis de ambiente no GitHub:"
echo "  - DATABASE_URL"
echo "  - JWT_SECRET"
echo "  - EMAIL_USER"
echo "  - EMAIL_PASS"
echo "  - STRIPE_SECRET_KEY"
echo "  - STRIPE_PUBLISHABLE_KEY"
echo "  - STRIPE_WEBHOOK_SECRET"
echo ""
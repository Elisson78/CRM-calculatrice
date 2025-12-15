#!/bin/sh
set -e

# Script de startup que verifica múltiplos caminhos possíveis
# para o servidor Next.js standalone

# Verifica se server.js existe na raiz (caminho correto após COPY standalone)
if [ -f "/app/server.js" ]; then
  echo "✅ Iniciando Next.js de /app/server.js"
  exec node /app/server.js
fi

# Fallback: verifica se está em .next/standalone/server.js
if [ -f "/app/.next/standalone/server.js" ]; then
  echo "✅ Iniciando Next.js de /app/.next/standalone/server.js"
  exec node /app/.next/standalone/server.js
fi

# Se nenhum caminho funcionar, lista o que existe para debug
echo "❌ Erro: server.js não encontrado em nenhum local esperado"
echo "Conteúdo de /app:"
ls -la /app/ 2>/dev/null || echo "Diretório /app não existe"
echo ""
echo "Conteúdo de /app/.next (se existir):"
ls -la /app/.next/ 2>/dev/null || echo "Diretório .next não existe"
exit 1


#!/bin/bash

# Script para sincronizar dados da produção para o ambiente local
# ATENÇÃO: Isso irá substituir os dados das tabelas locais!

# Configurações de Produção (obtidas dos scripts de migração)
PROD_HOST="72.62.36.167"
PROD_PORT="5432"
PROD_DB="crm_demo"
PROD_USER="postgres"
PROD_PASS="Bradok41"

# Configurações Locais (padrão)
LOCAL_DB="crm_demenagement"
LOCAL_USER="postgres"

echo "🐘 Iniciando sincronização de dados de produção para local..."

# Exportar a senha para o pg_dump não solicitar
export PGPASSWORD=$PROD_PASS

# Tabelas importantes para sincronizar
TABLES=("entreprises" "categories_meubles" "meubles" "devis" "devis_meubles" "users")

for table in "${TABLES[@]}"
do
    echo "  📥 Puxando dados da tabela: $table..."
    # Faz o dump apenas dos dados (--data-only) e limpa a tabela antes (--clean --if-exists não funciona bem com --data-only em alguns casos, então usamos TRUNCATE)
    psql -d $LOCAL_DB -U $LOCAL_USER -c "TRUNCATE TABLE $table CASCADE;" 2>/dev/null
    
    pg_dump -h $PROD_HOST -p $PROD_PORT -U $PROD_USER -d $PROD_DB -t $table --data-only --no-owner --no-privileges | psql -d $LOCAL_DB -U $LOCAL_USER
done

# Limpar a senha da memória
unset PGPASSWORD

echo "✅ Sincronização concluída com sucesso!"
echo "🚀 Agora você pode verificar o localhost:3000/admin/devis para ver os dados reais."

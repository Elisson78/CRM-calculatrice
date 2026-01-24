-- =====================================================
-- SCRIPT DE EXECUÇÃO DE MIGRAÇÕES
-- Execute este script para aplicar as correções de segurança
-- =====================================================

-- IMPORTANTE: Execute este script como usuário administrador (postgres)

\echo '========================================='
\echo 'INICIANDO HARDENING DE SEGURANÇA RLS'
\echo '========================================='

-- 1. Re-aplicar políticas fortalecidas
\echo 'Aplicando 013_rls_security_hardening.sql...'
\i /Users/elissonuzual/CRM-calculatrice/CRM-calculatrice/apps/web/migrations/013_rls_security_hardening.sql

-- 2. Criar usuário restrito
\echo 'Aplicando 014_create_restricted_app_role.sql...'
\i /Users/elissonuzual/CRM-calculatrice/CRM-calculatrice/apps/web/migrations/014_create_restricted_app_role.sql

\echo '========================================='
\echo 'MIGRAÇÕES APLICADAS COM SUCESSO!'
\echo '========================================='
\echo ''
\echo 'PRÓXIMOS PASSOS:'
\echo '1. Defina uma senha forte para moover_app_user:'
\echo '   ALTER ROLE moover_app_user WITH PASSWORD ''sua_senha_forte_aqui'';'
\echo ''
\echo '2. Atualize o .env.local com as novas credenciais:'
\echo '   DATABASE_URL=postgresql://moover_app_user:sua_senha@host:5432/database'
\echo ''
\echo '3. Reinicie a aplicação'
\echo ''

-- =====================================================
-- MOOVELABS SECURITY: Restricted Application Role
-- Criação de um usuário restrito para a aplicação
-- =====================================================

-- 1. Criar o role para a aplicação (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'moover_app_user') THEN
        CREATE ROLE moover_app_user WITH LOGIN PASSWORD 'CHANGE_ME_IN_PRODUCTION';
        RAISE NOTICE 'Role moover_app_user criado com sucesso';
    ELSE
        RAISE NOTICE 'Role moover_app_user já existe';
    END IF;
END
$$;

-- 2. Garantir que o usuário NÃO é superuser e NÃO bypassa RLS
ALTER ROLE moover_app_user WITH NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;

-- 3. Conceder permissões de conexão ao banco
GRANT CONNECT ON DATABASE postgres TO moover_app_user;

-- 4. Conceder permissões de uso no schema public
GRANT USAGE ON SCHEMA public TO moover_app_user;

-- 5. Conceder permissões de SELECT, INSERT, UPDATE, DELETE em todas as tabelas
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO moover_app_user;

-- 6. Conceder permissões em sequences (para auto-increment de IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO moover_app_user;

-- 7. Garantir que permissões futuras também sejam concedidas
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO moover_app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO moover_app_user;

-- 8. Conceder permissão para executar funções (triggers, etc)
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO moover_app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO moover_app_user;

-- =====================================================
-- IMPORTANTE: Após executar esta migração, você DEVE:
-- 1. Atualizar o .env.local com as credenciais do novo usuário
-- 2. Reiniciar a aplicação
-- 3. Executar testes de isolamento
-- =====================================================

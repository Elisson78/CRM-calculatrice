-- =====================================================
-- MOOVELABS SECURITY HARDENING
-- Criação de Usuário Limitado para Forçar RLS
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'moover_app') THEN
        -- Senha forte para o usuário da aplicação
        CREATE ROLE moover_app WITH LOGIN PASSWORD 'MooverApp_Secure2026_!!';
    END IF;
END
$$;

-- Garantir privilégios mínimos (NÃO é superuser, NÃO ignora RLS)
ALTER ROLE moover_app NOSUPERUSER NOBYPASSRLS NOCREATEROLE NOCREATEDB;

-- Conceder acesso ao schema public
GRANT USAGE ON SCHEMA public TO moover_app;

-- Conceder permissões em todas as tabelas e sequências atuais
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO moover_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO moover_app;

-- Garantir que futuras tabelas também sejam acessíveis
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO moover_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO moover_app;

COMMENT ON ROLE moover_app IS 'Usuário restrito para forçar isolamento de dados via RLS';

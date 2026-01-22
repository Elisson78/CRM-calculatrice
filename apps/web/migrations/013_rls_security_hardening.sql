-- =====================================================
-- MOOVELABS SECURITY HARDENING
-- Fortalecimento das políticas RLS para evitar vazamentos
-- =====================================================

-- 1. Fortalecer a política de isolamento de devis
-- A regra garante que:
-- - Ou o empresa_id bate exatamente com o contexto da sessão (que deve ser não vazio)
-- - Ou o usuário é um admin.
-- USING: controla SELECT, UPDATE, DELETE
-- WITH CHECK: controla INSERT, UPDATE (garante que novos dados também respeitam a regra)
DROP POLICY IF EXISTS devis_isolation ON devis;

CREATE POLICY devis_isolation ON devis
    FOR ALL
    USING (
        (entreprise_id::text = current_setting('app.current_entreprise_id', true) AND current_setting('app.current_entreprise_id', true) <> '')
        OR
        current_setting('app.current_user_role', true) = 'admin'
    )
    WITH CHECK (
        (entreprise_id::text = current_setting('app.current_entreprise_id', true) AND current_setting('app.current_entreprise_id', true) <> '')
        OR
        current_setting('app.current_user_role', true) = 'admin'
    );

-- 2. Fortalecer a política de isolamento de clientes
DROP POLICY IF EXISTS client_isolation ON clients;

CREATE POLICY client_isolation ON clients
    FOR ALL
    USING (
        (entreprise_id::text = current_setting('app.current_entreprise_id', true) AND current_setting('app.current_entreprise_id', true) <> '')
        OR
        current_setting('app.current_user_role', true) = 'admin'
    )
    WITH CHECK (
        (entreprise_id::text = current_setting('app.current_entreprise_id', true) AND current_setting('app.current_entreprise_id', true) <> '')
        OR
        current_setting('app.current_user_role', true) = 'admin'
    );

-- 3. Fortalecer a política de isolamento de logs
DROP POLICY IF EXISTS logs_isolation ON logs_activite;

CREATE POLICY logs_isolation ON logs_activite
    FOR ALL
    USING (
        (entreprise_id::text = current_setting('app.current_entreprise_id', true) AND current_setting('app.current_entreprise_id', true) <> '')
        OR
        current_setting('app.current_user_role', true) = 'admin'
    )
    WITH CHECK (
        (entreprise_id::text = current_setting('app.current_entreprise_id', true) AND current_setting('app.current_entreprise_id', true) <> '')
        OR
        current_setting('app.current_user_role', true) = 'admin'
    );

-- 4. Fortalecer a política de usuários (Escrita) - Garante que usuário só edita a si mesmo
DROP POLICY IF EXISTS user_write_self ON users;

CREATE POLICY user_write_self ON users
    FOR ALL
    USING (
        (id::text = current_setting('app.current_user_id', true) AND current_setting('app.current_user_id', true) <> '')
        OR
        current_setting('app.current_user_role', true) = 'admin'
    )
    WITH CHECK (
        (id::text = current_setting('app.current_user_id', true) AND current_setting('app.current_user_id', true) <> '')
        OR
        current_setting('app.current_user_role', true) = 'admin'
    );

-- 5. Fortalecer a política de empresas - Garante que empresa só vê a si mesma
DROP POLICY IF EXISTS entreprise_isolation ON entreprises;

CREATE POLICY entreprise_isolation ON entreprises
    FOR ALL
    USING (
        (id::text = current_setting('app.current_entreprise_id', true) AND current_setting('app.current_entreprise_id', true) <> '')
        OR
        current_setting('app.current_user_role', true) = 'admin'
    )
    WITH CHECK (
        (id::text = current_setting('app.current_entreprise_id', true) AND current_setting('app.current_entreprise_id', true) <> '')
        OR
        current_setting('app.current_user_role', true) = 'admin'
    );

-- Garantir que as tabelas possuem FORCE RLS (importante para o usuário moover_app)
ALTER TABLE devis FORCE ROW LEVEL SECURITY;
ALTER TABLE clients FORCE ROW LEVEL SECURITY;
ALTER TABLE logs_activite FORCE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE entreprises FORCE ROW LEVEL SECURITY;

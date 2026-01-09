-- =====================================================
-- MOOVELABS CRM DÉMÉNAGEMENT
-- Migração: Implementação de RLS (Row Level Security)
-- =====================================================

-- 1. Garantir que RLS está habilitado em todas as tabelas relevantes
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE entreprises ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories_meubles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meubles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE devis ENABLE ROW LEVEL SECURITY;
ALTER TABLE devis_meubles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_activite ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas existentes para evitar duplicidade
DROP POLICY IF EXISTS user_self_isolation ON users;
DROP POLICY IF EXISTS entreprise_isolation ON entreprises;
DROP POLICY IF EXISTS entreprise_public_read ON entreprises;
DROP POLICY IF EXISTS categories_public_read ON categories_meubles;
DROP POLICY IF EXISTS meubles_public_read ON meubles;
DROP POLICY IF EXISTS client_isolation ON clients;
DROP POLICY IF EXISTS devis_isolation ON devis;
DROP POLICY IF EXISTS devis_meubles_isolation ON devis_meubles;
DROP POLICY IF EXISTS notifications_isolation ON notifications;
DROP POLICY IF EXISTS logs_isolation ON logs_activite;

-- =====================================================
-- POLÍTICAS DE ACESSO
-- =====================================================

-- USERS: Isolamento para escrita/deleção, mas permite SELECT para autenticação
CREATE POLICY user_read_all ON users
    FOR SELECT
    USING (true);

CREATE POLICY user_write_self ON users
    FOR ALL
    USING (
        id = NULLIF(current_setting('app.current_user_id', true), '')::uuid OR 
        current_setting('app.current_user_role', true) = 'admin'
    )
    WITH CHECK (
        id = NULLIF(current_setting('app.current_user_id', true), '')::uuid OR 
        current_setting('app.current_user_role', true) = 'admin'
    );

-- ENTREPRISES: 
-- 1. Ver por ID da sessão
-- 2. Ver por Slug (necessário para a calculadora pública)
CREATE POLICY entreprise_isolation ON entreprises
    FOR ALL
    USING (
        id = NULLIF(current_setting('app.current_entreprise_id', true), '')::uuid OR
        current_setting('app.current_user_role', true) = 'admin'
    );

CREATE POLICY entreprise_public_read ON entreprises
    FOR SELECT
    USING (actif = true); -- Permite selecionar empresas ativas (necessário para busca por slug)

-- CATEGORIES & MEUBLES: Leitura pública (catálogo), Escrita (restrita se necessário)
CREATE POLICY categories_public_read ON categories_meubles FOR SELECT USING (true);
CREATE POLICY meubles_public_read ON meubles FOR SELECT USING (true);

-- CLIENTS, DEVIS, NOTIFICATIONS, LOGS: Isolamento estrito por entreprise_id
CREATE POLICY client_isolation ON clients
    FOR ALL
    USING (
        entreprise_id = NULLIF(current_setting('app.current_entreprise_id', true), '')::uuid OR
        current_setting('app.current_user_role', true) = 'admin'
    );

CREATE POLICY devis_isolation ON devis
    FOR ALL
    USING (
        entreprise_id = NULLIF(current_setting('app.current_entreprise_id', true), '')::uuid OR
        current_setting('app.current_user_role', true) = 'admin'
    );

CREATE POLICY devis_meubles_isolation ON devis_meubles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM devis 
            WHERE devis.id = devis_meubles.devis_id AND 
            (devis.entreprise_id = NULLIF(current_setting('app.current_entreprise_id', true), '')::uuid OR 
             current_setting('app.current_user_role', true) = 'admin')
        )
    );

CREATE POLICY notifications_isolation ON notifications
    FOR ALL
    USING (
        user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
    );

CREATE POLICY logs_isolation ON logs_activite
    FOR ALL
    USING (
        entreprise_id = NULLIF(current_setting('app.current_entreprise_id', true), '')::uuid OR
        current_setting('app.current_user_role', true) = 'admin'
    );

-- =====================================================
-- NOTA: Como estamos usando conexão direta (Node.js pg), 
-- o usuário do banco (ex: 'postgres') geralmente é BYPASSRLS ou SUPERUSER.
-- Para que o RLS funcione, as queries devem ser executadas por um papel não-superuser
-- ou as tabelas devem ter FORCE ROW LEVEL SECURITY.
-- =====================================================

ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE entreprises FORCE ROW LEVEL SECURITY;
ALTER TABLE categories_meubles FORCE ROW LEVEL SECURITY;
ALTER TABLE meubles FORCE ROW LEVEL SECURITY;
ALTER TABLE clients FORCE ROW LEVEL SECURITY;
ALTER TABLE devis FORCE ROW LEVEL SECURITY;
ALTER TABLE devis_meubles FORCE ROW LEVEL SECURITY;
ALTER TABLE notifications FORCE ROW LEVEL SECURITY;
ALTER TABLE logs_activite FORCE ROW LEVEL SECURITY;

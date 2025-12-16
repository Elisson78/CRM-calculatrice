-- Migration: Adicionar configuração SMTP personalizada para empresas
-- Data: 2024-12-16

-- Adicionar campos de configuração SMTP na tabela empresas
ALTER TABLE entreprises 
ADD COLUMN IF NOT EXISTS smtp_host VARCHAR(255),
ADD COLUMN IF NOT EXISTS smtp_port INTEGER,
ADD COLUMN IF NOT EXISTS smtp_user VARCHAR(255), 
ADD COLUMN IF NOT EXISTS smtp_password TEXT,
ADD COLUMN IF NOT EXISTS smtp_secure BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS use_custom_smtp BOOLEAN DEFAULT FALSE;

-- Comentários pour documentation
COMMENT ON COLUMN entreprises.smtp_host IS 'Serveur SMTP personnalisé (ex: smtp.gmail.com)';
COMMENT ON COLUMN entreprises.smtp_port IS 'Port du serveur SMTP (587, 465, 25)';
COMMENT ON COLUMN entreprises.smtp_user IS 'Nom d''utilisateur/email pour authentification SMTP';
COMMENT ON COLUMN entreprises.smtp_password IS 'Mot de passe pour authentification SMTP';
COMMENT ON COLUMN entreprises.smtp_secure IS 'Utiliser TLS/SSL pour la connexion SMTP';
COMMENT ON COLUMN entreprises.use_custom_smtp IS 'Activer l''utilisation du SMTP personnalisé';
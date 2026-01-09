-- Adicionar campos para recuperação de senha
ALTER TABLE users 
ADD COLUMN reset_password_token TEXT,
ADD COLUMN reset_password_expires TIMESTAMP WITH TIME ZONE;

-- Adicionar índice para busca rápida por token
CREATE INDEX idx_users_reset_token ON users(reset_password_token);

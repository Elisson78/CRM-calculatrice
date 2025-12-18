-- Migration 006: Adicionar campo logo_data para armazenar imagem em Base64
-- Data: 2025-12-18

-- Adicionar coluna logo_data para armazenar a imagem como Base64
ALTER TABLE entreprises 
ADD COLUMN logo_data TEXT;

-- Adicionar comentário explicativo
COMMENT ON COLUMN entreprises.logo_data IS 'Dados da logo em formato Base64 (data:image/type;base64,...)';

-- Criar índice para otimizar consultas (opcional)
-- CREATE INDEX idx_entreprises_logo_data ON entreprises USING HASH (logo_data) WHERE logo_data IS NOT NULL;
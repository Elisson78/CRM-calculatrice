-- Migration 005: Adicionar campo logo_size na tabela empresas
-- Data: 2025-12-17

-- Adicionar coluna logo_size com valor padrão 100
ALTER TABLE entreprises 
ADD COLUMN logo_size INTEGER DEFAULT 100;

-- Adicionar comentário
COMMENT ON COLUMN entreprises.logo_size IS 'Tamanho da logo em pixels (padrão: 100px)';
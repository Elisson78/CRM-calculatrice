-- Migration: Adicionar campos Stripe para assinaturas
-- Data: Dezembro 2025

-- Adicionar campos Stripe na tabela entreprises
ALTER TABLE entreprises 
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS subscription_current_period_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_cancel_at_period_end BOOLEAN DEFAULT FALSE;

-- Criar índice para busca rápida por customer_id
CREATE INDEX IF NOT EXISTS idx_entreprises_stripe_customer ON entreprises(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_entreprises_stripe_subscription ON entreprises(stripe_subscription_id);

-- Comentários
COMMENT ON COLUMN entreprises.stripe_customer_id IS 'ID do cliente no Stripe';
COMMENT ON COLUMN entreprises.stripe_subscription_id IS 'ID da assinatura no Stripe';
COMMENT ON COLUMN entreprises.stripe_price_id IS 'ID do preço/plano no Stripe';
COMMENT ON COLUMN entreprises.subscription_status IS 'Status da assinatura (active, canceled, past_due, etc)';
COMMENT ON COLUMN entreprises.subscription_current_period_start IS 'Início do período atual de cobrança';
COMMENT ON COLUMN entreprises.subscription_current_period_end IS 'Fim do período atual de cobrança';
COMMENT ON COLUMN entreprises.subscription_cancel_at_period_end IS 'Se a assinatura será cancelada no fim do período';





-- Migração 007: Adicionar campos de controle de assinatura Stripe
-- Esta migração adiciona os campos necessários para controlar as assinaturas do Stripe

-- Adicionar campos de assinatura
ALTER TABLE entreprises 
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS plan_active BOOLEAN DEFAULT true;
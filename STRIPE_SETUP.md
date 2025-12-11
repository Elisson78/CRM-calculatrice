# 💳 Configuração Stripe - Moovelabs

> Guia completo para configurar pagamentos com Stripe

## 📋 Pré-requisitos

1. Conta no Stripe (https://stripe.com)
2. Acesso ao dashboard do Stripe
3. Chaves API do Stripe

---

## 🔑 Configuração das Variáveis de Ambiente

Adicione as seguintes variáveis ao arquivo `.env.local`:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (criar no dashboard do Stripe)
STRIPE_PRICE_ID_BASIC=price_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_ENTERPRISE=price_...

# App URL (para webhooks e redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📝 Passo a Passo

### 1. Obter Chaves API do Stripe

1. Acesse: https://dashboard.stripe.com/apikeys
2. Copie:
   - **Secret key** (sk_test_... ou sk_live_...)
   - **Publishable key** (pk_test_... ou pk_live_...)

### 2. Criar Produtos e Preços no Stripe

#### No Dashboard do Stripe:

1. Acesse: https://dashboard.stripe.com/products
2. Clique em **"Create product"**

#### Produto 1: Basic Plan
- **Name**: Moovelabs Basic
- **Pricing model**: Standard pricing
- **Price**: 29 CHF
- **Billing period**: Monthly
- **Copy o Price ID** gerado (price_...)

#### Produto 2: Pro Plan
- **Name**: Moovelabs Pro
- **Pricing model**: Standard pricing
- **Price**: 79 CHF
- **Billing period**: Monthly
- **Copy o Price ID** gerado (price_...)

#### Produto 3: Enterprise Plan
- **Name**: Moovelabs Enterprise
- **Pricing model**: Standard pricing
- **Price**: 199 CHF
- **Billing period**: Monthly
- **Copy o Price ID** gerado (price_...)

### 3. Configurar Webhooks

#### 3.1 Criar Endpoint no Stripe

1. Acesse: https://dashboard.stripe.com/webhooks
2. Clique em **"Add endpoint"**
3. **Endpoint URL**: `https://seu-dominio.com/api/stripe/webhook`
   - Para desenvolvimento local, use: `https://seu-ngrok-url.ngrok.io/api/stripe/webhook`
4. **Events to send**: Selecione:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. **Copy o Webhook Secret** (whsec_...)

#### 3.2 Testar Webhook Localmente

Para desenvolvimento local, você precisa expor sua aplicação:

```bash
# Opção 1: Usar Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Opção 2: Usar ngrok
ngrok http 3000
# Use a URL do ngrok no endpoint do Stripe
```

---

## 🗄️ Executar Migration

Execute a migration para adicionar campos Stripe no banco:

```bash
# Via psql diretamente
psql -h 72.62.36.167 -U postgres -d crm_demenagement -f apps/web/migrations/004_add_stripe_fields.sql

# Ou via script Node.js (se existir)
npm run db:migrate
```

---

## ✅ Testar a Integração

### 1. Testar Checkout

1. Acesse `/pricing`
2. Clique em um plano
3. Deve redirecionar para o Stripe Checkout
4. Use cartão de teste: `4242 4242 4242 4242`
5. Data: qualquer data futura
6. CVC: qualquer 3 dígitos

### 2. Testar Webhook

1. Complete um checkout de teste
2. Verifique se o webhook foi recebido
3. Verifique se o `plan` da empresa foi atualizado no banco

### 3. Verificar Status

1. Acesse `/dashboard/settings`
2. Deve mostrar o plano ativo
3. Botão "Gérer l'abonnement" deve abrir o Customer Portal

---

## 🧪 Cartões de Teste do Stripe

### Sucesso
- **Cartão**: `4242 4242 4242 4242`
- **Data**: Qualquer data futura
- **CVC**: Qualquer 3 dígitos

### Requer Autenticação 3D Secure
- **Cartão**: `4000 0025 0000 3155`

### Recusado
- **Cartão**: `4000 0000 0000 0002`

Mais cartões: https://stripe.com/docs/testing

---

## 🔒 Produção

### Checklist Antes de Ir para Produção

- [ ] Mudar para chaves **LIVE** do Stripe
- [ ] Atualizar `STRIPE_SECRET_KEY` para `sk_live_...`
- [ ] Atualizar `STRIPE_PUBLISHABLE_KEY` para `pk_live_...`
- [ ] Configurar webhook com URL de produção
- [ ] Criar produtos e preços em modo LIVE
- [ ] Atualizar `NEXT_PUBLIC_APP_URL` com URL de produção
- [ ] Testar checkout completo em produção
- [ ] Configurar notificações de webhook (email)

---

## 📚 Recursos Úteis

- **Documentação Stripe**: https://stripe.com/docs
- **Dashboard Stripe**: https://dashboard.stripe.com
- **Test Cards**: https://stripe.com/docs/testing
- **Webhooks Guide**: https://stripe.com/docs/webhooks

---

## 🐛 Troubleshooting

### Webhook não está sendo recebido

1. Verificar se o endpoint está acessível publicamente
2. Verificar se o webhook secret está correto
3. Verificar logs do servidor
4. Usar Stripe CLI para testar: `stripe trigger checkout.session.completed`

### Checkout não redireciona

1. Verificar chaves API no `.env.local`
2. Verificar se os Price IDs estão corretos
3. Verificar console do navegador para erros

### Subscription não atualiza após pagamento

1. Verificar se webhook foi recebido
2. Verificar logs do webhook handler
3. Verificar se metadata está sendo enviada corretamente

---

## 📝 Arquivos Criados

- `apps/web/src/lib/stripe.ts` - Configuração do Stripe
- `apps/web/src/app/api/stripe/create-checkout/route.ts` - Criar checkout
- `apps/web/src/app/api/stripe/webhook/route.ts` - Webhook handler
- `apps/web/src/app/api/stripe/create-portal/route.ts` - Customer Portal
- `apps/web/src/app/pricing/page.tsx` - Página de planos
- `apps/web/migrations/004_add_stripe_fields.sql` - Migration banco

---

**Última atualização**: Dezembro 2025

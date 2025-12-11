# 🚨 Ações Prioritárias - CRM Déménagement

> Ações que devem ser tomadas imediatamente

---

## 🔴 URGENTE - Segurança (Fazer HOJE)

### 1. Remover Credenciais Expostas
- [ ] **Arquivo**: `CONFIGURACAO_BANCO_DADOS.md`
  - Remover ou mascarar senha do banco de dados
  - Usar apenas referências a variáveis de ambiente

- [ ] **Arquivo**: `.env.local` (se versionado)
  - Garantir que está no `.gitignore`
  - Criar `.env.example` com placeholders

### 2. Configurar Variáveis de Ambiente
- [ ] Criar `.env.example` na raiz do projeto
- [ ] Validar que todas as variáveis necessárias estão documentadas
- [ ] Verificar que `JWT_SECRET` usa variável de ambiente (não hardcoded)

### 3. Segurança do Banco de Dados
- [ ] Implementar policies RLS no Supabase
- [ ] Testar que usuários só veem seus próprios dados
- [ ] Validar que admin pode ver tudo

---

## 🟡 IMPORTANTE - Funcionalidades MVP Faltantes (Esta Semana)

### 1. Dashboard Cliente
**Status**: ❌ Não implementado

**Arquivos a criar**:
```
apps/web/src/app/(dashboard)/client/
├── page.tsx                    # Dashboard principal
├── devis/
│   ├── page.tsx               # Lista de devis
│   └── [id]/
│       └── page.tsx           # Detalhes do devis
└── profil/
    └── page.tsx               # Perfil do cliente
```

**API Routes necessárias**:
```
apps/web/src/app/api/client/
├── devis/
│   └── route.ts              # GET /api/client/devis
└── profil/
    └── route.ts              # GET/PATCH /api/client/profil
```

**Tarefas**:
- [ ] Criar estrutura de pastas
- [ ] Implementar página de lista de devis
- [ ] Implementar página de detalhes do devis
- [ ] Implementar página de perfil
- [ ] Criar API routes
- [ ] Adicionar navegação no layout

### 2. Recuperação de Senha
**Status**: ❌ Não implementado

**Tarefas**:
- [ ] Criar página `/forgot-password`
- [ ] Criar página `/reset-password/[token]`
- [ ] Criar API route `/api/auth/forgot-password`
- [ ] Criar API route `/api/auth/reset-password`
- [ ] Implementar envio de email com token
- [ ] Implementar validação de token

### 3. Upload de Logo Funcional
**Status**: ⚠️ Parcialmente implementado

**Problema**: Interface existe mas pode não estar conectada ao storage

**Tarefas**:
- [ ] Verificar se API `/api/upload/logo` está funcional
- [ ] Configurar storage (Supabase Storage ou similar)
- [ ] Testar upload completo
- [ ] Implementar preview antes de salvar
- [ ] Validar tipos de arquivo e tamanho

---

## 🟢 MELHORIAS - Validação e Qualidade (Próximas 2 Semanas)

### 1. Implementar Validação com Zod

**Schemas a criar**:

```typescript
// apps/web/src/lib/validations/auth.ts
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  nom: z.string().min(2),
  // ...
});

// apps/web/src/lib/validations/devis.ts
export const devisSchema = z.object({
  nom: z.string().min(2),
  email: z.string().email(),
  telephone: z.string().optional(),
  adresse_depart: z.string().min(5),
  // ...
});

// apps/web/src/lib/validations/entreprise.ts
export const entrepriseUpdateSchema = z.object({
  nom: z.string().min(2).optional(),
  email: z.string().email().optional(),
  // ...
});
```

**Tarefas**:
- [ ] Instalar/verificar Zod está instalado
- [ ] Criar schemas de validação
- [ ] Aplicar validação em todos os formulários
- [ ] Aplicar validação em todas as API routes
- [ ] Criar mensagens de erro amigáveis

### 2. Migrar Sistema de Email para Resend

**Status**: 📦 Resend já está no package.json, mas não está sendo usado

**Tarefas**:
- [ ] Criar conta na Resend (se não tiver)
- [ ] Obter API key
- [ ] Adicionar `RESEND_API_KEY` ao `.env.local`
- [ ] Refatorar `apps/web/src/lib/email.ts` para usar Resend
- [ ] Testar envio de emails
- [ ] Remover dependência de nodemailer (ou manter como fallback)

**Código exemplo**:
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDevisEmails(data: DevisEmailData) {
  // Enviar email ao cliente
  await resend.emails.send({
    from: 'Moovelabs <noreply@moovelabs.com>',
    to: data.clientEmail,
    subject: `✅ Votre demande de devis`,
    html: getClientEmailTemplate(data),
  });
  
  // Enviar email à empresa
  await resend.emails.send({
    from: 'Moovelabs <noreply@moovelabs.com>',
    to: data.entreprise.email,
    subject: `🔔 Nouvelle demande de devis`,
    html: getEntrepriseEmailTemplate(data),
  });
}
```

### 3. Completar Funcionalidades Parciais

#### Personalização de Cores
- [ ] Verificar se cores estão sendo salvas corretamente
- [ ] Testar persistência
- [ ] Adicionar preview em tempo real
- [ ] Validar formato hexadecimal

#### Detalhes do Devis
- [ ] Verificar se página `/dashboard/devis/[id]` está completa
- [ ] Adicionar edição de status
- [ ] Adicionar campo de preço
- [ ] Adicionar notas internas

---

## 📋 Checklist Semanal

### Semana 1: Segurança e Base
- [ ] Remover credenciais expostas
- [ ] Configurar variáveis de ambiente
- [ ] Implementar RLS policies
- [ ] Migrar email para Resend
- [ ] Implementar validação básica com Zod

### Semana 2: Dashboard Cliente
- [ ] Criar estrutura de pastas
- [ ] Implementar lista de devis
- [ ] Implementar detalhes do devis
- [ ] Implementar perfil do cliente
- [ ] Criar API routes

### Semana 3: Recuperação e Upload
- [ ] Implementar recuperação de senha
- [ ] Completar upload de logo
- [ ] Testes de integração
- [ ] Documentação básica

### Semana 4: Melhorias e Polishing
- [ ] Melhorias de UX/UI
- [ ] Validações completas
- [ ] Testes de responsividade
- [ ] Correção de bugs

---

## 🔧 Comandos Úteis

### Verificar Variáveis de Ambiente
```bash
# Verificar se .env.local existe
ls -la .env.local

# Verificar se está no .gitignore
grep -i "\.env" .gitignore
```

### Testar Conexão com Banco
```bash
cd apps/web
node scripts/test-db-connection.js
```

### Rodar Migrations
```bash
# Verificar quais migrations existem
ls apps/web/migrations/

# Aplicar migrations (ajustar script se necessário)
npm run db:migrate
```

### Testar API Routes
```bash
# Com servidor rodando
curl http://localhost:3000/api/auth/me
```

---

## 📝 Notas Importantes

1. **Nunca commitar** arquivos `.env.local` ou com credenciais
2. **Sempre validar** dados de entrada nas API routes
3. **Usar HTTPS** em produção
4. **Implementar rate limiting** nas APIs públicas
5. **Fazer backup** regular do banco de dados

---

**Última atualização**: Dezembro 2025

# Informações para Instalação e Entrega do Projeto

Este documento contém os dados e arquivos necessários para a realização da instalação do sistema em um novo ambiente.

## 1. Pacote de Arquivos do Código
Devem ser entregues os seguintes diretórios e arquivos da raiz do projeto:
- `apps/` (Contém o código da aplicação web)
- `scripts/` (Scripts de migração e utilitários)
- `agents/` (Prompts e configurações de IA)
- `package.json` e `package-lock.json`
- `Dockerfile` e `.dockerignore`
- `easypanel-config.json`

> [!IMPORTANT]
> A pasta `node_modules` **não** deve ser incluída no envio.

## 2. Dados do Sistema (Banco de Dados)
Para que o sistema funcione com os dados atuais, é necessário fornecer:
- **Backup do Banco de Dados**: Um arquivo `.sql` (Dump) contendo todas as tabelas, triggers e registros atuais dos clientes e orçamentos.

## 3. Configurações de Ambiente (Variáveis)
O novo ambiente precisará configurar as seguintes variáveis (as chaves):

- **Banco de Dados**: `DATABASE_URL` (String de conexão PostgreSQL)
- **Segurança**: `JWT_SECRET` (Chave para criptografia de sessões)
- **E-mail (SMTP)**: `EMAIL_USER` e `EMAIL_PASS` (Credenciais para envio de e-mails automáticos)
- **Pagamentos**: `STRIPE_SECRET_KEY` e `STRIPE_PUBLISHABLE_KEY` (Caso utilize integração com Stripe)

## 4. Acesso Administrativo
Após a instalação, o acesso ao painel de administração deve ser feito com as seguintes credenciais:

- **Usuário**: `contacto@vsr-demenagement.ch`
- **Senha**: [Inserir senha definida para este usuário]

---
*Nota: Este documento contém apenas os dados necessários para a migração, não incluindo instruções de implantação.*

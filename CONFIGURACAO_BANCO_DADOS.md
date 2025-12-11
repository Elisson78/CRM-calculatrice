# 🔧 Configuração de Conexão com Banco de Dados PostgreSQL

## 📋 Informações de Conexão

> **⚠️ IMPORTANTE**: Este arquivo contém apenas exemplos. **NUNCA** commite senhas ou credenciais reais no repositório!

Configure as seguintes variáveis no arquivo `.env.local` (que está no `.gitignore`):

- **Tipo:** PostgreSQL
- **Host:** Configurar via variável de ambiente
- **Porta:** `5432` (padrão)
- **Banco de Dados:** Configurar via variável de ambiente
- **Usuário:** Configurar via variável de ambiente
- **Senha:** ⚠️ Configurar via variável de ambiente (NUNCA no código!)

---

## ⚙️ Configuração do Projeto

### 1. Arquivo `.env.local`

Copie o arquivo `.env.example` para `.env.local` e preencha com seus valores reais:

```bash
cp .env.example .env.local
```

Exemplo de estrutura (sem valores reais):

```env
# ================================================================
# VARIÁVEIS DE AMBIENTE - MOOVELABS CRM
# Banco de Dados PostgreSQL
# ================================================================

# ==================== DATABASE ====================
# Conexão com banco PostgreSQL
DATABASE_URL="postgresql://usuario:senha@host:5432/nome_banco?schema=public"

# Configurações individuais do banco (opcional)
DB_HOST=seu-host-postgres
DB_PORT=5432
DB_NAME=nome_banco
DB_USER=usuario
DB_PASSWORD=senha_segura
DB_SCHEMA=public
```

> **🔒 Segurança**: O arquivo `.env.local` está no `.gitignore` e NÃO será versionado.

### 2. Estrutura de Variáveis

O arquivo contém:

- **DATABASE_URL**: String de conexão completa no formato URI
- **DB_HOST**: Host do servidor PostgreSQL
- **DB_PORT**: Porta do servidor (padrão: 5432)
- **DB_NAME**: Nome do banco de dados
- **DB_USER**: Usuário para autenticação
- **DB_PASSWORD**: Senha do usuário
- **DB_SCHEMA**: Schema padrão (public)

---

## 🧪 Teste de Conexão

### Opção 1: Script Node.js (Recomendado)

Foi criado um script de teste em `test-db-connection.js` que valida a conexão e lista as tabelas do banco.

#### Pré-requisitos

```bash
npm install pg dotenv
```

#### Executar o teste

```bash
node test-db-connection.js
```

O script irá:
- ✅ Verificar se a conexão é estabelecida
- 📅 Exibir data/hora do servidor
- 🗄️ Mostrar versão do PostgreSQL
- 📋 Listar todas as tabelas do banco

### Opção 2: Teste Manual via psql

Se você tiver o cliente PostgreSQL instalado:

```bash
psql -h 72.62.36.167 -p 5432 -U postgres -d crm_demenagement
```

Quando solicitado, digite a senha: `Bradok41`

### Opção 3: Teste via pgAdmin

1. Abra o pgAdmin 4
2. Clique em "Add New Server"
3. Na aba "General", defina um nome (ex: "CRM Déménagement")
4. Na aba "Connection":
   - **Host:** `72.62.36.167`
   - **Port:** `5432`
   - **Maintenance database:** `crm_demenagement`
   - **Username:** `postgres`
   - **Password:** `Bradok41`
5. Clique em "Save"

---

## 🔌 Integração no Projeto

### Para Node.js/Express

#### 1. Instalar dependências

```bash
npm install pg dotenv
```

#### 2. Criar arquivo de configuração do banco

```javascript
// config/database.js
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false, // Altere para true se necessário
});

module.exports = pool;
```

#### 3. Usar em seus controllers/models

```javascript
// exemplo de uso
const pool = require('./config/database');

async function getClients() {
  const result = await pool.query('SELECT * FROM clients');
  return result.rows;
}
```

### Para Python/Django

#### 1. Instalar dependências

```bash
pip install psycopg2-binary python-dotenv
```

#### 2. Configurar no `settings.py`

```python
import os
from dotenv import load_dotenv

load_dotenv('.env.local')

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT'),
    }
}
```

### Para Python/Flask

```python
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv

load_dotenv('.env.local')

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
db = SQLAlchemy(app)
```

---

## 🔒 Segurança

### ⚠️ Importante

1. **Nunca commite o arquivo `.env.local` no Git**
   - Adicione `.env.local` ao `.gitignore`
   - Use `.env.example` como template (sem valores sensíveis)

2. **Proteção de Credenciais**
   - Mantenha as senhas seguras
   - Use variáveis de ambiente em produção
   - Considere usar um gerenciador de secrets (AWS Secrets Manager, HashiCorp Vault, etc.)

3. **Conexão SSL**
   - Para produção, considere habilitar SSL:
     ```env
     DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
     ```

---

## 📊 Status da Conexão

### Verificação Rápida

Execute o script de teste para verificar se tudo está funcionando:

```bash
node test-db-connection.js
```

### Output Esperado

```
🔄 Tentando conectar ao banco de dados...

📍 Host: 72.62.36.167
📊 Database: crm_demenagement

✅ Conexão estabelecida com sucesso!

📅 Data/Hora do Servidor: 2025-12-03 14:25:00.000000-03:00
🗄️  Versão PostgreSQL: PostgreSQL 14.x

📋 Tabelas encontradas (X):
   1. tabela1
   2. tabela2
   ...

✅ Teste de conexão concluído com sucesso!
🎉 O banco de dados está pronto para uso.
```

---

## 🐛 Troubleshooting

### Erro: "ECONNREFUSED"
- Verifique se o servidor PostgreSQL está rodando
- Confirme que o host e porta estão corretos
- Verifique as regras de firewall

### Erro: "28P01" - Autenticação falhou
- Confirme usuário e senha
- Verifique permissões do usuário no PostgreSQL

### Erro: "3D000" - Banco não existe
- Confirme o nome do banco de dados
- Verifique se o banco foi criado

### Erro: "Módulo não encontrado"
- Execute: `npm install pg dotenv` (Node.js)
- Execute: `pip install psycopg2-binary python-dotenv` (Python)

---

## 📝 Notas Adicionais

- O arquivo `.env.local` deve estar na raiz do projeto
- As variáveis são carregadas automaticamente pelo `dotenv`
- Para diferentes ambientes, use `.env.development`, `.env.production`, etc.
- Sempre teste a conexão após qualquer alteração nas credenciais

---

## ✅ Checklist de Configuração

- [x] Arquivo `.env.local` criado
- [x] Variáveis de ambiente configuradas
- [x] Script de teste criado
- [ ] Dependências instaladas (`pg` e `dotenv`)
- [ ] Teste de conexão executado com sucesso
- [ ] Integração no projeto configurada
- [ ] `.env.local` adicionado ao `.gitignore`

---

**Última atualização:** 03/12/2025




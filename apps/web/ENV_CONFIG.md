# Configuration des Variables d'Environnement

Créez un fichier `.env.local` à la racine de `apps/web/` avec les variables suivantes:

```env
# ===========================================
# MOOVELABS - Variables d'environnement
# ===========================================

# Base de données PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crm_demenagement
DB_USER=postgres
DB_PASSWORD=your_password_here

# URL de l'application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Resend (pour l'envoi d'emails)
RESEND_API_KEY=re_xxxxxxxxxxxx

# Configuration optionnelle
NODE_ENV=development
```

## Description des variables

| Variable | Description | Obligatoire |
|----------|-------------|-------------|
| `DB_HOST` | Hôte de la base de données | ✅ |
| `DB_PORT` | Port PostgreSQL (défaut: 5432) | ✅ |
| `DB_NAME` | Nom de la base de données | ✅ |
| `DB_USER` | Utilisateur PostgreSQL | ✅ |
| `DB_PASSWORD` | Mot de passe PostgreSQL | ✅ |
| `NEXT_PUBLIC_APP_URL` | URL publique de l'app | ✅ |
| `RESEND_API_KEY` | Clé API Resend pour emails | ⚠️ |

## Obtenir une clé Resend

1. Créer un compte sur [resend.com](https://resend.com)
2. Aller dans API Keys
3. Créer une nouvelle clé
4. Copier la clé dans `RESEND_API_KEY`





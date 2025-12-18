# 🚚 Moovelabs - CRM Déménagement SaaS

> Plateforme SaaS multi-entreprises pour entreprises de déménagement avec calculatrice de volume personnalisée.

![Version](https://img.shields.io/badge/version-1.0.0--MVP-blue)
![License](https://img.shields.io/badge/license-Private-red)
![Status](https://img.shields.io/badge/status-En%20développement-yellow)

## 📋 Description

**Moovelabs** est une plateforme CRM complète permettant aux entreprises de déménagement de :
- 🧮 Avoir leur propre calculatrice de volume personnalisée (logo, couleurs, lien unique)
- 👥 Gérer leurs clients et demandes de devis
- 📧 Automatiser l'envoi d'emails avec les résultats
- 📊 Suivre les statistiques de leur activité

## 🎯 Fonctionnalités Principales

### 3 Dashboards

| Dashboard | Description |
|-----------|-------------|
| **Admin** | Gestion globale de la plateforme, entreprises, catalogue de meubles |
| **Entreprise** | Personnalisation calculatrice, gestion devis/clients |
| **Client** | Historique des demandes, profil |

### Calculatrice de Volume

- ✅ Sélection de meubles par catégorie (Salon, Cuisine, Chambre, Extérieur, Cartons)
- ✅ Calcul automatique du volume en m³
- ✅ Formulaire de contact intégré
- ✅ Personnalisation par entreprise (logo, couleurs)
- ✅ Envoi automatique d'email au client et à l'entreprise

## 🛠️ Stack Technique

### Frontend
- **Next.js 14+** (App Router)
- **React 18+**
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** (animations)
- **Radix UI** (composants accessibles)

### Backend
- **Supabase** (PostgreSQL, Auth, Storage, Edge Functions)
- **Resend** (emails)

### Infrastructure
- **Vercel** (hébergement)
- **Supabase Cloud** (BaaS)

## 📁 Structure du Projet

```
moovelabs/
├── apps/
│   └── web/                    # Application Next.js
├── packages/
│   ├── database/               # Schémas et migrations
│   ├── emails/                 # Templates emails
│   └── shared/                 # Code partagé
├── supabase/
│   ├── migrations/             # Migrations SQL
│   └── seed.sql                # Données initiales
└── docs/                       # Documentation
```

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+
- npm ou pnpm
- Compte Supabase

### Installation

```bash
# Cloner le projet
git clone https://github.com/votre-repo/moovelabs.git
cd moovelabs

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local

# Lancer le serveur de développement
npm run dev
```

### Configuration Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Exécuter les migrations : `supabase/migrations/001_initial_schema.sql`
3. Charger les données : `supabase/seed.sql`
4. Configurer les variables d'environnement

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 📖 Documentation

- [MVP Complet](./MVP_MOOVELABS.md) - Spécifications détaillées
- [Schéma Base de Données](./supabase/migrations/001_initial_schema.sql)
- [Données Initiales](./supabase/seed.sql)

## 🎨 Design System

### Couleurs par défaut

| Couleur | Hex | Usage |
|---------|-----|-------|
| Primary | `#1e3a5f` | Éléments principaux |
| Secondary | `#2563eb` | Boutons, liens |
| Accent | `#dc2626` | Alertes, compteurs |
| Background | `#f8fafc` | Fond de page |

### Catégories de Meubles

| Catégorie | Couleur | Icône |
|-----------|---------|-------|
| Salon | `#1e3a5f` | 🛋️ |
| Cuisine | `#2563eb` | 🍳 |
| Chambre | `#7c3aed` | 🛏️ |
| Extérieur | `#059669` | 🌳 |
| Cartons | `#d97706` | 📦 |

## 🗓️ Roadmap MVP

### Phase 1: Fondations ✅
- [x] Schéma de base de données
- [x] Données initiales (meubles, catégories)
- [ ] Configuration projet Next.js

### Phase 2: Calculatrice 🔄
- [ ] Page calculatrice dynamique
- [ ] Sélection des meubles
- [ ] Calcul du volume
- [ ] Formulaire de contact
- [ ] Envoi d'emails

### Phase 3: Dashboard Entreprise
- [ ] Personnalisation calculatrice
- [ ] Liste des devis
- [ ] Gestion clients

### Phase 4: Dashboard Admin
- [ ] Gestion entreprises
- [ ] Catalogue meubles
- [ ] Statistiques

### Phase 5: Dashboard Client
- [ ] Historique demandes
- [ ] Profil

## 🤝 Contribuer

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📄 License

Projet privé - Tous droits réservés © 2025 Moovelabs

## 📞 Contact

- **Email**: support@moovelabs.com
- **Site**: [moovelabs.com](https://moovelabs.com)

---

**Créé avec ❤️ par l'équipe Moovelabs**










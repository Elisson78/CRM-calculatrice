# 📋 Prochaines Étapes - Moovelabs MVP

> Guide pas à pas pour le développement du MVP

---

## ✅ Étapes Complétées

| # | Tâche | Fichier |
|---|-------|---------|
| 1 | Documentation MVP complète | `MVP_MOOVELABS.md` |
| 2 | Schéma de base de données | `supabase/migrations/001_initial_schema.sql` |
| 3 | Données initiales (meubles, catégories) | `supabase/seed.sql` |
| 4 | README du projet | `README.md` |

---

## 🔜 Prochaines Étapes

### Étape 5: Configuration du Projet Next.js

```bash
# Créer le projet Next.js dans le dossier apps/web
npx create-next-app@latest apps/web --typescript --tailwind --eslint --app --src-dir

# Installer les dépendances supplémentaires
cd apps/web
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-checkbox
npm install framer-motion
npm install react-hook-form @hookform/resolvers zod
npm install @tanstack/react-query
npm install zustand
npm install lucide-react
npm install resend
npm install clsx tailwind-merge
```

### Étape 6: Configuration Supabase

1. **Créer un projet Supabase** sur https://supabase.com
2. **Exécuter les migrations** dans l'éditeur SQL:
   - Copier le contenu de `supabase/migrations/001_initial_schema.sql`
   - Exécuter dans Supabase SQL Editor
3. **Charger les données initiales**:
   - Copier le contenu de `supabase/seed.sql`
   - Exécuter dans Supabase SQL Editor
4. **Configurer l'authentification**:
   - Activer Email/Password dans Authentication > Providers
5. **Créer le fichier `.env.local`**:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (Resend)
RESEND_API_KEY=your-resend-api-key
```

### Étape 7: Développer la Calculatrice de Volume

**Fichiers à créer:**

```
apps/web/src/
├── app/
│   └── calculatrice/
│       └── [slug]/
│           └── page.tsx          # Page de la calculatrice
├── components/
│   └── calculatrice/
│       ├── CategoryTabs.tsx      # Onglets des catégories
│       ├── FurnitureGrid.tsx     # Grille des meubles
│       ├── FurnitureCard.tsx     # Carte d'un meuble
│       ├── VolumeDisplay.tsx     # Affichage du volume
│       ├── ContactForm.tsx       # Formulaire de contact
│       └── SubmitButton.tsx      # Bouton d'envoi
├── hooks/
│   └── useCalculatrice.ts        # Hook de la calculatrice
├── stores/
│   └── calculatriceStore.ts      # Store Zustand
└── lib/
    └── supabase/
        └── client.ts             # Client Supabase
```

**Priorité de développement:**

1. 🥇 Page calculatrice avec sélection des meubles
2. 🥈 Calcul du volume en temps réel
3. 🥉 Formulaire de contact
4. 📧 Envoi d'emails

### Étape 8: Dashboard Entreprise

**Fonctionnalités à développer:**

1. **Authentification** (login, register, logout)
2. **Liste des devis** reçus
3. **Détail d'un devis** (meubles, client, adresses)
4. **Personnalisation** de la calculatrice:
   - Upload logo
   - Choix des couleurs
   - Prévisualisation
5. **Lien de partage** et QR code

### Étape 9: Dashboard Admin

**Fonctionnalités:**

1. **Liste des entreprises** inscrites
2. **Gestion du catalogue** de meubles:
   - Ajouter/modifier/supprimer
   - Upload images
   - Catégories
3. **Statistiques globales**

### Étape 10: Dashboard Client

**Fonctionnalités:**

1. **Historique** des demandes de devis
2. **Détail** d'une demande
3. **Profil** utilisateur

---

## 📝 Commandes Utiles

### Développement

```bash
# Lancer le serveur de développement
npm run dev

# Build production
npm run build

# Lancer les tests
npm run test

# Linter
npm run lint
```

### Supabase

```bash
# Installer Supabase CLI
npm install -g supabase

# Login
supabase login

# Lier au projet
supabase link --project-ref your-project-ref

# Appliquer les migrations
supabase db push

# Générer les types TypeScript
supabase gen types typescript --local > src/types/database.types.ts
```

### Git

```bash
# Nouveau commit
git add .
git commit -m "feat: description de la fonctionnalité"

# Push
git push origin main

# Créer une branche
git checkout -b feature/nom-fonctionnalite
```

---

## 🎯 Objectifs du MVP

| Priorité | Fonctionnalité | Status |
|----------|----------------|--------|
| P0 | Calculatrice de volume fonctionnelle | 🔴 À faire |
| P0 | Formulaire de contact | 🔴 À faire |
| P0 | Envoi d'email au client et entreprise | 🔴 À faire |
| P1 | Dashboard entreprise basique | 🔴 À faire |
| P1 | Personnalisation calculatrice (logo, couleurs) | 🔴 À faire |
| P2 | Dashboard admin | 🔴 À faire |
| P2 | Dashboard client | 🔴 À faire |

**Légende:**
- 🔴 À faire
- 🟡 En cours
- 🟢 Terminé

---

## 📞 Support

Pour toute question sur le développement:
- Consulter la documentation dans `MVP_MOOVELABS.md`
- Vérifier les commentaires dans le code SQL

---

*Dernière mise à jour: Décembre 2025*




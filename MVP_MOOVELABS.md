# 🚚 MOOVELABS - CRM Déménagement SaaS MVP

> **Plateforme SaaS Multi-Entreprises pour Entreprises de Déménagement**

---

## 📋 Vision du Projet

**Moovelabs** est une plateforme SaaS complète permettant aux entreprises de déménagement de:
- Avoir leur propre calculatrice de volume personnalisée
- Gérer leurs clients et devis
- Automatiser l'envoi d'emails avec les résultats

---

## 🏗️ Architecture des Dashboards

### 1️⃣ Dashboard Admin Plateforme
> Gestion globale de la plateforme Moovelabs

**Fonctionnalités:**
- 📊 Statistiques globales (entreprises, clients, devis)
- 🏢 Gestion des entreprises inscrites
- 👥 Gestion des utilisateurs
- 📦 Gestion du catalogue de meubles (images, m³, kg)
- ⚙️ Configuration de la plateforme
- 📈 Rapports et analytics
- 💳 Gestion des abonnements/plans

### 2️⃣ Dashboard Entreprises de Déménagement
> Espace dédié à chaque entreprise

**Fonctionnalités:**
- 🎨 **Personnalisation de la calculatrice:**
  - Upload du logo
  - Choix des couleurs (primaire, secondaire, accent)
  - Nom de l'entreprise
  - Lien unique généré automatiquement
  - Option domaine/sous-domaine personnalisé

- 📊 **Gestion des devis:**
  - Liste des demandes de devis
  - Statuts (Nouveau, En cours, Accepté, Refusé)
  - Détails des meubles sélectionnés
  - Volume total en m³

- 👥 **Gestion des clients:**
  - Liste des clients
  - Historique des demandes
  - Informations de contact

- 🔗 **Liens et intégration:**
  - Lien de la calculatrice à partager
  - Code embed pour site web
  - QR Code de la calculatrice

- ⚙️ **Configuration:**
  - Informations de l'entreprise
  - Email de notification
  - Modèle d'email personnalisé

### 3️⃣ Dashboard Clients
> Espace client simple et fonctionnel

**Fonctionnalités:**
- 📋 Historique des demandes de devis
- 📦 Détail des meubles sélectionnés par demande
- 📄 Téléchargement des récapitulatifs
- ✏️ Modification des informations personnelles

---

## 🧮 Calculatrice de Volume

### Interface de la Calculatrice

```
┌─────────────────────────────────────────────────────────────┐
│  [LOGO ENTREPRISE]     NOM ENTREPRISE        home | contact │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│        Simulateur de volume pour déménagement               │
│                                                              │
│  ┌─────────┬─────────┬──────────┬───────────┬─────────┐    │
│  │ SALON   │ CUISINE │ CHAMBRE  │ EXTERIEUR │ CARTONS │    │
│  └─────────┴─────────┴──────────┴───────────┴─────────┘    │
│                                                              │
│                   VOLUME: 2.50 M³                           │
│                                                              │
│  ╔═══════════════════════════════════════════════════════╗  │
│  ║                       salon                            ║  │
│  ╠═══════════════════════════════════════════════════════╣  │
│  ║  ┌──────────┐  ┌──────────┐  ┌──────────┐            ║  │
│  ║  │ [image]  │  │ [image]  │  │ [image]  │            ║  │
│  ║  │Bibliothèq│  │  Buffet  │  │Canapé 2P │            ║  │
│  ║  │  ⊖ 0 ⊕  │  │  ⊖ 1 ⊕  │  │  ⊖ 0 ⊕  │            ║  │
│  ║  └──────────┘  └──────────┘  └──────────┘            ║  │
│  ╚═══════════════════════════════════════════════════════╝  │
│                                                              │
│  [Barre de résumé avec volume total]                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Formulaire Final (après sélection des meubles)

```
┌─────────────────────────────────────────────────────────────┐
│                  Vous concernant                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Nom entreprise: [VSR DEMENAGEMENT - readonly]           ││
│  │ Nom: [__________________]                               ││
│  │ E-mail: [__________________]                            ││
│  │ Téléphone: [__________________]                         ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│                 Votre déménagement                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Adresse de départ + CP: [__________________]            ││
│  │ ☐ Avec ascenseur départ  ☐ Sans ascenseur départ       ││
│  │                                                         ││
│  │ Adresse d'arrivée + CP: [__________________]            ││
│  │ ☐ Avec ascenseur arrivée ☐ Sans ascenseur arrivée      ││
│  │                                                         ││
│  │ Date de départ: [__/__/____]                            ││
│  │ Date d'arrivée: [__/__/____]                            ││
│  │                                                         ││
│  │ Observations: [________________________]                ││
│  │               [________________________]                ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ℹ️ Ces informations ne serviront qu'à l'édition de votre   │
│     devis et ne seront JAMAIS transmises ou vendu à un      │
│     tiers.                                                  │
│                                                              │
│              [        Envoyer        ]                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Modèle de Données (PostgreSQL/Supabase)

### Tables Principales

```sql
-- =====================================================
-- TABLE: users (Utilisateurs de la plateforme)
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'entreprise', 'client')),
    nom VARCHAR(255),
    prenom VARCHAR(255),
    telephone VARCHAR(50),
    avatar_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- TABLE: entreprises (Entreprises de déménagement)
-- =====================================================
CREATE TABLE entreprises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(50),
    adresse TEXT,
    code_postal VARCHAR(20),
    ville VARCHAR(100),
    pays VARCHAR(100) DEFAULT 'Suisse',
    logo_url TEXT,
    
    -- Personnalisation calculatrice
    couleur_primaire VARCHAR(7) DEFAULT '#1e3a5f',
    couleur_secondaire VARCHAR(7) DEFAULT '#2563eb',
    couleur_accent VARCHAR(7) DEFAULT '#dc2626',
    
    -- Liens
    slug VARCHAR(100) UNIQUE NOT NULL,
    domaine_personnalise VARCHAR(255),
    
    -- Configuration emails
    email_notification VARCHAR(255),
    template_email TEXT,
    
    -- Statut
    actif BOOLEAN DEFAULT TRUE,
    plan VARCHAR(50) DEFAULT 'basic',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- TABLE: categories_meubles (Catégories de meubles)
-- =====================================================
CREATE TABLE categories_meubles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(100) NOT NULL,
    nom_affichage VARCHAR(100) NOT NULL,
    ordre INTEGER DEFAULT 0,
    icone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Données initiales des catégories
INSERT INTO categories_meubles (nom, nom_affichage, ordre) VALUES
('salon', 'SALON', 1),
('cuisine', 'CUISINE', 2),
('chambre', 'CHAMBRE', 3),
('exterieur', 'EXTERIEUR', 4),
('carton', 'CARTONS', 5);

-- =====================================================
-- TABLE: meubles (Catalogue de meubles)
-- =====================================================
CREATE TABLE meubles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categorie_id UUID REFERENCES categories_meubles(id),
    nom VARCHAR(255) NOT NULL,
    volume_m3 DECIMAL(5,2) NOT NULL,
    poids_kg DECIMAL(6,2),
    image_url TEXT,
    actif BOOLEAN DEFAULT TRUE,
    ordre INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: clients (Clients des entreprises)
-- =====================================================
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    entreprise_id UUID REFERENCES entreprises(id) ON DELETE CASCADE,
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: devis (Demandes de devis/déménagement)
-- =====================================================
CREATE TABLE devis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entreprise_id UUID REFERENCES entreprises(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    
    -- Informations client (si pas de compte)
    client_nom VARCHAR(255),
    client_email VARCHAR(255) NOT NULL,
    client_telephone VARCHAR(50),
    
    -- Adresses
    adresse_depart TEXT NOT NULL,
    code_postal_depart VARCHAR(20),
    avec_ascenseur_depart BOOLEAN DEFAULT FALSE,
    etage_depart INTEGER,
    
    adresse_arrivee TEXT NOT NULL,
    code_postal_arrivee VARCHAR(20),
    avec_ascenseur_arrivee BOOLEAN DEFAULT FALSE,
    etage_arrivee INTEGER,
    
    -- Dates
    date_demenagement DATE,
    date_arrivee DATE,
    flexibilite_dates BOOLEAN DEFAULT FALSE,
    
    -- Volume et détails
    volume_total_m3 DECIMAL(8,2) NOT NULL,
    poids_total_kg DECIMAL(10,2),
    observations TEXT,
    
    -- Statut
    statut VARCHAR(50) DEFAULT 'nouveau' CHECK (statut IN (
        'nouveau', 'en_attente', 'devis_envoye', 'accepte', 'refuse', 'termine'
    )),
    
    -- Emails
    email_client_envoye BOOLEAN DEFAULT FALSE,
    email_entreprise_envoye BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: devis_meubles (Meubles sélectionnés par devis)
-- =====================================================
CREATE TABLE devis_meubles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    devis_id UUID REFERENCES devis(id) ON DELETE CASCADE,
    meuble_id UUID REFERENCES meubles(id) ON DELETE SET NULL,
    meuble_nom VARCHAR(255) NOT NULL,
    quantite INTEGER NOT NULL DEFAULT 1,
    volume_unitaire_m3 DECIMAL(5,2) NOT NULL,
    volume_total_m3 DECIMAL(8,2) GENERATED ALWAYS AS (quantite * volume_unitaire_m3) STORED,
    poids_unitaire_kg DECIMAL(6,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: configurations_plateforme (Config admin)
-- =====================================================
CREATE TABLE configurations_plateforme (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cle VARCHAR(100) UNIQUE NOT NULL,
    valeur TEXT,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEX pour performance
-- =====================================================
CREATE INDEX idx_entreprises_slug ON entreprises(slug);
CREATE INDEX idx_entreprises_user ON entreprises(user_id);
CREATE INDEX idx_clients_entreprise ON clients(entreprise_id);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_devis_entreprise ON devis(entreprise_id);
CREATE INDEX idx_devis_client ON devis(client_id);
CREATE INDEX idx_devis_statut ON devis(statut);
CREATE INDEX idx_devis_created ON devis(created_at DESC);
CREATE INDEX idx_meubles_categorie ON meubles(categorie_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) pour Supabase
-- =====================================================
ALTER TABLE entreprises ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE devis ENABLE ROW LEVEL SECURITY;
ALTER TABLE devis_meubles ENABLE ROW LEVEL SECURITY;

-- Policies pour entreprises
CREATE POLICY "Entreprises peuvent voir leurs propres données"
ON entreprises FOR SELECT
USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
));

-- Policies pour devis
CREATE POLICY "Entreprises peuvent voir leurs devis"
ON devis FOR SELECT
USING (
    entreprise_id IN (
        SELECT id FROM entreprises WHERE user_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
);
```

---

## 📦 Données Initiales - Catalogue de Meubles

```sql
-- =====================================================
-- INSERTION DES MEUBLES (depuis les CSV fournis)
-- =====================================================

-- SALON
INSERT INTO meubles (categorie_id, nom, volume_m3, poids_kg, image_url, ordre) VALUES
((SELECT id FROM categories_meubles WHERE nom = 'salon'), 'Bibliothèque', 1.2, 15, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1735489840544x904022806971936300/Petite%20biblioth%C3%A8que.webp', 1),
((SELECT id FROM categories_meubles WHERE nom = 'salon'), 'Buffet', 1.5, 45, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1735489802261x849193286203502100/Buffet%20bas.webp', 2),
((SELECT id FROM categories_meubles WHERE nom = 'salon'), 'Canapé 2 places', 2.0, 20, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1735489615451x820428570471216000/Canap%C3%A9%202P.webp', 3),
((SELECT id FROM categories_meubles WHERE nom = 'salon'), 'Canapé 3P', 2.5, 60, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1735489628809x944110831238731400/Canap%C3%A9%203P.webp', 4),
((SELECT id FROM categories_meubles WHERE nom = 'salon'), 'Abat-jour', 0.5, 1, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1735488904899x533495552631593400/Abat-jour.webp', 5),
((SELECT id FROM categories_meubles WHERE nom = 'salon'), 'Chaise', 0.5, 4, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1735490591958x989183067463846400/Chaise.webp', 6),
((SELECT id FROM categories_meubles WHERE nom = 'salon'), 'Fauteuil', 0.9, 6, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1735583123936x487427412436841860/Fauteuil%201P.webp', 7),
((SELECT id FROM categories_meubles WHERE nom = 'salon'), 'Tapis', 0.9, 2, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1735583401930x107023961503429860/Tapis.webp', 8),
((SELECT id FROM categories_meubles WHERE nom = 'salon'), 'Miroir', 0.3, 7, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736094611767x169315776646676400/Miroir.webp', 9),
((SELECT id FROM categories_meubles WHERE nom = 'salon'), 'Tableau', 0.5, 1, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736094709249x186441748332206940/Tableau.webp', 10),
((SELECT id FROM categories_meubles WHERE nom = 'salon'), 'Table 5P+', 1.8, 12, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736095461645x392895986165997500/Table%205P%2B.webp', 11),
((SELECT id FROM categories_meubles WHERE nom = 'salon'), 'Table 4P', 1.2, 5, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736095552440x456874900441054400/Table%204P.webp', 12),
((SELECT id FROM categories_meubles WHERE nom = 'salon'), 'Piano droit', 2.0, 150, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736095592963x895536368695606100/Piano%20droit.webp', 13),
((SELECT id FROM categories_meubles WHERE nom = 'salon'), 'Piano à queue', 3.5, 600, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736095682918x132669894037796830/Piano%20%C3%A0%20queue.webp', 14),
((SELECT id FROM categories_meubles WHERE nom = 'salon'), 'Meuble TV', 1.1, 50, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736095794950x421439807213654460/Meuble%20TV.webp', 15),
((SELECT id FROM categories_meubles WHERE nom = 'salon'), 'Télévision', 0.5, 25, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736095929755x738855760113732500/Grande%20t%C3%A9l%C3%A9vision.webp', 16),
((SELECT id FROM categories_meubles WHERE nom = 'salon'), 'Table de chevet', 0.4, 6, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736097424699x233068855517087680/Table%20de%20chevet.webp', 17);

-- CUISINE
INSERT INTO meubles (categorie_id, nom, volume_m3, poids_kg, image_url, ordre) VALUES
((SELECT id FROM categories_meubles WHERE nom = 'cuisine'), 'Lave vaisselle', 0.8, 12, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736096061616x672044287679901000/Lave%20vaisselle.webp', 1),
((SELECT id FROM categories_meubles WHERE nom = 'cuisine'), 'Cuisinière', 0.8, 30, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736096341411x282923771715384300/Cuisini%C3%A8re.webp', 2),
((SELECT id FROM categories_meubles WHERE nom = 'cuisine'), 'Micro-ondes', 0.2, 12, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736096486314x286882568280442100/Micro-ondes.webp', 3),
((SELECT id FROM categories_meubles WHERE nom = 'cuisine'), 'Frigo standard', 1.8, 80, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736096658859x427612531134093060/Frigo%20standard.webp', 4),
((SELECT id FROM categories_meubles WHERE nom = 'cuisine'), 'Machine à laver', 0.8, 70, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736096721835x916609380057913600/Machine%20%C3%A0%20laver.webp', 5),
((SELECT id FROM categories_meubles WHERE nom = 'cuisine'), 'Frigo américain', 2.0, 115, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736096834563x250757391156319880/Frigo%20am%C3%A9ricain.webp', 6),
((SELECT id FROM categories_meubles WHERE nom = 'cuisine'), 'Petit vaisselier', 1.2, 65, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736096908987x238402032729279300/Petit%20vaisselier.webp', 7),
((SELECT id FROM categories_meubles WHERE nom = 'cuisine'), 'Grand vaisselier', 2.0, 135, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736097046897x740223435676885100/Grand%20vaisselier.webp', 8);

-- CHAMBRE
INSERT INTO meubles (categorie_id, nom, volume_m3, poids_kg, image_url, ordre) VALUES
((SELECT id FROM categories_meubles WHERE nom = 'chambre'), 'Bureau', 1.0, 60, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736097297807x480589876716402940/Bureau.webp', 1),
((SELECT id FROM categories_meubles WHERE nom = 'chambre'), 'Petite commode', 1.0, 4, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736097480438x790341711657917700/Petite%20commode.webp', 2),
((SELECT id FROM categories_meubles WHERE nom = 'chambre'), 'Petite armoire', 2.0, 45, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736097557700x890823448637562600/Petite%20armoire.webp', 3),
((SELECT id FROM categories_meubles WHERE nom = 'chambre'), 'Ordinateur', 0.3, 5, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736097708525x872011956565524600/Ordinateur.webp', 4),
((SELECT id FROM categories_meubles WHERE nom = 'chambre'), 'Chaise de bureau', 0.5, 7, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736097798692x761624833006052200/Chaise%20de%20bureau.webp', 5),
((SELECT id FROM categories_meubles WHERE nom = 'chambre'), 'Lit 1P', 2.0, 25, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736097863959x337241796597034240/Lit%201P.webp', 6),
((SELECT id FROM categories_meubles WHERE nom = 'chambre'), 'Lit 2P', 4.0, 50, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736097918742x435531110634275400/Lit%202P.webp', 7),
((SELECT id FROM categories_meubles WHERE nom = 'chambre'), 'Lit superposé', 2.0, 60, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736097971170x685238272041344800/Lit%20superpos%C3%A9.webp', 8),
((SELECT id FROM categories_meubles WHERE nom = 'chambre'), 'Grande armoire', 3.0, 70, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736098048934x310054732560592000/Grande%20armoire.webp', 9),
((SELECT id FROM categories_meubles WHERE nom = 'chambre'), 'Lit bébé', 1.2, 15, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736098112968x135117290924204210/Lit%20b%C3%A9b%C3%A9.webp', 10);

-- EXTERIEUR
INSERT INTO meubles (categorie_id, nom, volume_m3, poids_kg, image_url, ordre) VALUES
((SELECT id FROM categories_meubles WHERE nom = 'exterieur'), 'Vélo adulte', 1.0, 7, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736098484781x444933831702661000/V%C3%A9lo%20adulte.webp', 1),
((SELECT id FROM categories_meubles WHERE nom = 'exterieur'), 'Tondeuse', 0.4, 16, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736098597290x517570108468452740/Tondeuse.webp', 2),
((SELECT id FROM categories_meubles WHERE nom = 'exterieur'), 'Banc exterieur', 1.5, 25, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736098649057x445284535417335360/Banc%20exterieur.webp', 3),
((SELECT id FROM categories_meubles WHERE nom = 'exterieur'), 'Table de ping-pong', 1.8, 60, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736098696850x317627912746737400/Table%20de%20ping-pong.webp', 4),
((SELECT id FROM categories_meubles WHERE nom = 'exterieur'), 'Parasol', 0.5, 40, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736098748061x194110665624281700/Parasol.webp', 5),
((SELECT id FROM categories_meubles WHERE nom = 'exterieur'), 'Panier de basket', 0.7, 45, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736098829232x565134825605674940/Panier%20de%20basket.webp', 6),
((SELECT id FROM categories_meubles WHERE nom = 'exterieur'), 'Chaise de jardin', 0.5, 4, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736098897472x505632258183601000/Chaise%20de%20jardin.webp', 7),
((SELECT id FROM categories_meubles WHERE nom = 'exterieur'), 'Table de jardin', 1.3, 25, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736098962041x309633254904936500/Table%20de%20jardin.webp', 8);

-- CARTONS
INSERT INTO meubles (categorie_id, nom, volume_m3, poids_kg, image_url, ordre) VALUES
((SELECT id FROM categories_meubles WHERE nom = 'carton'), 'Carton standard', 0.3, 10, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736097182885x342887467343209200/Carton%20standard.webp', 1),
((SELECT id FROM categories_meubles WHERE nom = 'carton'), 'Petit carton', 0.2, 5, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736097215890x606574224422563000/Petit%20carton.webp', 2),
((SELECT id FROM categories_meubles WHERE nom = 'carton'), 'Carton penderie', 0.7, 10, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1737365868354x511525886960984000/Carton%20penderie.jpg', 3);
```

---

## 🛠️ Stack Technique

### Frontend
```
├── Next.js 14+ (App Router)
├── React 18+
├── TypeScript
├── Tailwind CSS 4.x
├── Framer Motion (animations)
├── Radix UI (composants accessibles)
├── React Hook Form + Zod (formulaires)
├── TanStack Query (état serveur)
└── Zustand (état global)
```

### Backend
```
├── Supabase
│   ├── PostgreSQL (base de données)
│   ├── Auth (authentification)
│   ├── Storage (fichiers/logos)
│   ├── Realtime (temps réel)
│   └── Edge Functions (emails)
├── Resend ou Sendgrid (emails)
└── n8n (automations/webhooks)
```

### Infrastructure
```
├── Vercel (hébergement Next.js)
├── Supabase Cloud (BaaS)
├── Cloudflare (DNS/CDN)
└── n8n Cloud ou Self-hosted
```

---

## 📁 Structure du Projet

```
moovelabs/
├── apps/
│   └── web/                          # Application Next.js
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/           # Routes authentification
│       │   │   │   ├── login/
│       │   │   │   ├── register/
│       │   │   │   └── forgot-password/
│       │   │   │
│       │   │   ├── (dashboard)/      # Routes protégées
│       │   │   │   ├── admin/        # Dashboard Admin
│       │   │   │   │   ├── entreprises/
│       │   │   │   │   ├── meubles/
│       │   │   │   │   ├── users/
│       │   │   │   │   └── settings/
│       │   │   │   │
│       │   │   │   ├── entreprise/   # Dashboard Entreprise
│       │   │   │   │   ├── devis/
│       │   │   │   │   ├── clients/
│       │   │   │   │   ├── calculatrice/
│       │   │   │   │   └── settings/
│       │   │   │   │
│       │   │   │   └── client/       # Dashboard Client
│       │   │   │       ├── mes-devis/
│       │   │   │       └── profil/
│       │   │   │
│       │   │   ├── calculatrice/     # Calculatrice publique
│       │   │   │   └── [slug]/       # /calculatrice/vsr-demenagement
│       │   │   │
│       │   │   ├── api/              # API Routes
│       │   │   │   ├── devis/
│       │   │   │   ├── emails/
│       │   │   │   └── webhooks/
│       │   │   │
│       │   │   ├── layout.tsx
│       │   │   └── page.tsx          # Landing page
│       │   │
│       │   ├── components/
│       │   │   ├── ui/               # Composants UI de base
│       │   │   ├── calculatrice/     # Composants calculatrice
│       │   │   ├── dashboard/        # Composants dashboards
│       │   │   └── forms/            # Formulaires
│       │   │
│       │   ├── lib/
│       │   │   ├── supabase/         # Client Supabase
│       │   │   ├── utils/            # Utilitaires
│       │   │   └── validations/      # Schemas Zod
│       │   │
│       │   ├── hooks/                # Hooks personnalisés
│       │   ├── stores/               # Stores Zustand
│       │   └── types/                # Types TypeScript
│       │
│       ├── public/
│       ├── tailwind.config.ts
│       └── next.config.js
│
├── packages/
│   ├── database/                     # Schémas et migrations
│   ├── emails/                       # Templates emails
│   └── shared/                       # Code partagé
│
├── supabase/
│   ├── migrations/                   # Migrations SQL
│   ├── functions/                    # Edge Functions
│   └── seed.sql                      # Données initiales
│
└── docs/                             # Documentation
```

---

## 🔐 Système de Rôles et Permissions

| Fonctionnalité | Admin | Entreprise | Client |
|----------------|-------|------------|--------|
| Voir toutes les entreprises | ✅ | ❌ | ❌ |
| Gérer catalogue meubles | ✅ | ❌ | ❌ |
| Personnaliser calculatrice | ❌ | ✅ | ❌ |
| Voir ses devis | ❌ | ✅ | ✅ |
| Gérer ses clients | ❌ | ✅ | ❌ |
| Créer un devis (calculatrice) | ❌ | ❌ | ✅ |
| Voir statistiques globales | ✅ | ❌ | ❌ |
| Voir ses statistiques | ❌ | ✅ | ❌ |

---

## 📧 Flux d'Emails

### 1. Email au Client après soumission

```
Objet: Votre demande de devis - [Nom Entreprise]

Bonjour [Nom Client],

Nous avons bien reçu votre demande de devis pour votre déménagement.

📦 Récapitulatif de votre demande:

Volume total: X.XX m³

Meubles sélectionnés:
- 2x Canapé 3P (5.0 m³)
- 1x Lit 2P (4.0 m³)
- 10x Carton standard (3.0 m³)
...

📍 Adresses:
• Départ: [Adresse départ]
• Arrivée: [Adresse arrivée]

📅 Date souhaitée: [Date]

[Nom Entreprise] vous contactera rapidement.

Cordialement,
[Nom Entreprise]
```

### 2. Email à l'Entreprise

```
Objet: 🚚 Nouvelle demande de devis - [Nom Client]

Nouvelle demande de devis reçue!

👤 Client:
• Nom: [Nom]
• Email: [Email]
• Téléphone: [Téléphone]

📦 Volume total: X.XX m³

📍 Déménagement:
• De: [Adresse départ] (Ascenseur: Oui/Non)
• À: [Adresse arrivée] (Ascenseur: Oui/Non)

📅 Date: [Date]

📝 Observations: [Observations]

[Voir les détails dans le dashboard →]
```

---

## 🚀 Plan de Développement MVP

### Phase 1: Fondations (Semaine 1-2)
- [ ] Configuration projet Next.js + Supabase
- [ ] Schéma de base de données
- [ ] Authentification (login, register, roles)
- [ ] Layout des dashboards

### Phase 2: Calculatrice (Semaine 3-4)
- [ ] Page calculatrice dynamique par slug
- [ ] Sélection des meubles par catégorie
- [ ] Calcul du volume en temps réel
- [ ] Formulaire de soumission
- [ ] Envoi des emails

### Phase 3: Dashboard Entreprise (Semaine 5-6)
- [ ] Liste et détails des devis
- [ ] Gestion des clients
- [ ] Personnalisation calculatrice (logo, couleurs)
- [ ] Lien et QR code de la calculatrice

### Phase 4: Dashboard Admin (Semaine 7)
- [ ] Gestion des entreprises
- [ ] Gestion du catalogue de meubles
- [ ] Statistiques globales

### Phase 5: Dashboard Client (Semaine 8)
- [ ] Historique des demandes
- [ ] Détails des devis
- [ ] Profil utilisateur

### Phase 6: Polishing (Semaine 9-10)
- [ ] Tests et corrections
- [ ] Optimisations performance
- [ ] Documentation
- [ ] Déploiement production

---

## 💡 Fonctionnalités Futures (Post-MVP)

- 📊 Analytics avancés
- 💳 Système de facturation/abonnements
- 📱 Application mobile
- 🤖 Estimation automatique de prix
- 📅 Calendrier de disponibilité
- 💬 Chat en temps réel
- 🔗 API publique
- 🌍 Multi-langues
- 📄 Génération de PDF
- ✍️ Signature électronique des devis

---

## 🎨 Design System - Couleurs par Défaut

```css
:root {
  /* Couleurs principales Moovelabs */
  --primary: #1e3a5f;        /* Bleu foncé */
  --secondary: #2563eb;      /* Bleu vif */
  --accent: #dc2626;         /* Rouge */
  --background: #f8fafc;     /* Gris clair */
  --foreground: #0f172a;     /* Texte */
  
  /* Couleurs personnalisables par entreprise */
  --entreprise-primary: var(--primary);
  --entreprise-secondary: var(--secondary);
  --entreprise-accent: var(--accent);
}
```

---

## 📝 Notes de Développement

1. **Slug unique**: Chaque entreprise a un slug unique pour sa calculatrice
   - Exemple: `/calculatrice/vsr-demenagement`

2. **Personnalisation**: Les couleurs et logo sont stockés dans la table `entreprises`

3. **Emails**: Utiliser Resend ou Sendgrid via Edge Functions Supabase

4. **Storage**: Logos uploadés dans Supabase Storage

5. **SEO**: Pages calculatrices optimisées pour le référencement

---

## ✅ Checklist Avant Lancement

- [ ] Tests de tous les formulaires
- [ ] Tests responsive (mobile/tablet/desktop)
- [ ] Tests d'envoi d'emails
- [ ] Configuration DNS pour domaines personnalisés
- [ ] Backup automatique base de données
- [ ] Monitoring et alertes
- [ ] RGPD compliance (mentions légales, CGU)
- [ ] SSL/HTTPS configuré

---

**Créé avec ❤️ par l'équipe Moovelabs**

*Dernière mise à jour: Décembre 2025*




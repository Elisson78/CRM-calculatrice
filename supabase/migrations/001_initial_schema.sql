-- =====================================================
-- MOOVELABS CRM DÉMÉNAGEMENT
-- Migration Initiale - Schéma de Base de Données
-- =====================================================

-- Activer l'extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: users (Utilisateurs de la plateforme)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'entreprise', 'client')),
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
CREATE TABLE IF NOT EXISTS entreprises (
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
    couleur_fond VARCHAR(7) DEFAULT '#f8fafc',
    
    -- Liens
    slug VARCHAR(100) UNIQUE NOT NULL,
    domaine_personnalise VARCHAR(255),
    
    -- Configuration emails
    email_notification VARCHAR(255),
    template_email_client TEXT,
    template_email_entreprise TEXT,
    
    -- Configuration SMTP personnalisée
    smtp_host VARCHAR(255),
    smtp_port INTEGER,
    smtp_user VARCHAR(255),
    smtp_password TEXT,
    smtp_secure BOOLEAN DEFAULT TRUE,
    use_custom_smtp BOOLEAN DEFAULT FALSE,
    
    -- Configuration calculatrice
    titre_calculatrice VARCHAR(255) DEFAULT 'Simulateur de volume pour déménagement',
    message_formulaire TEXT DEFAULT 'Ces informations ne serviront qu''à l''édition de votre devis et ne seront JAMAIS transmises ou vendu à un tiers.',
    
    -- Statut
    actif BOOLEAN DEFAULT TRUE,
    plan VARCHAR(50) DEFAULT 'basic' CHECK (plan IN ('basic', 'pro', 'enterprise')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- TABLE: categories_meubles (Catégories de meubles)
-- =====================================================
CREATE TABLE IF NOT EXISTS categories_meubles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(100) NOT NULL UNIQUE,
    nom_affichage VARCHAR(100) NOT NULL,
    ordre INTEGER DEFAULT 0,
    icone VARCHAR(100),
    couleur VARCHAR(7) DEFAULT '#2563eb',
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: meubles (Catalogue de meubles)
-- =====================================================
CREATE TABLE IF NOT EXISTS meubles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categorie_id UUID REFERENCES categories_meubles(id) ON DELETE SET NULL,
    nom VARCHAR(255) NOT NULL,
    volume_m3 DECIMAL(5,2) NOT NULL,
    poids_kg DECIMAL(6,2),
    image_url TEXT,
    description TEXT,
    actif BOOLEAN DEFAULT TRUE,
    ordre INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: clients (Clients des entreprises)
-- =====================================================
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    entreprise_id UUID REFERENCES entreprises(id) ON DELETE CASCADE,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(50),
    adresse TEXT,
    code_postal VARCHAR(20),
    ville VARCHAR(100),
    pays VARCHAR(100) DEFAULT 'Suisse',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- TABLE: devis (Demandes de devis/déménagement)
-- =====================================================
CREATE TABLE IF NOT EXISTS devis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(50) UNIQUE,
    entreprise_id UUID REFERENCES entreprises(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    
    -- Informations client (si pas de compte)
    client_nom VARCHAR(255),
    client_prenom VARCHAR(255),
    client_email VARCHAR(255) NOT NULL,
    client_telephone VARCHAR(50),
    
    -- Adresse de départ
    adresse_depart TEXT NOT NULL,
    code_postal_depart VARCHAR(20),
    ville_depart VARCHAR(100),
    avec_ascenseur_depart BOOLEAN DEFAULT FALSE,
    etage_depart INTEGER,
    
    -- Adresse d'arrivée
    adresse_arrivee TEXT NOT NULL,
    code_postal_arrivee VARCHAR(20),
    ville_arrivee VARCHAR(100),
    avec_ascenseur_arrivee BOOLEAN DEFAULT FALSE,
    etage_arrivee INTEGER,
    
    -- Dates
    date_demenagement DATE,
    date_arrivee DATE,
    flexibilite_dates BOOLEAN DEFAULT FALSE,
    creneau_horaire VARCHAR(50),
    
    -- Volume et détails
    volume_total_m3 DECIMAL(8,2) NOT NULL DEFAULT 0,
    poids_total_kg DECIMAL(10,2) DEFAULT 0,
    nombre_meubles INTEGER DEFAULT 0,
    observations TEXT,
    
    -- Prix (optionnel - pour devis envoyé)
    montant_estime DECIMAL(10,2),
    devise VARCHAR(3) DEFAULT 'CHF',
    
    -- Statut
    statut VARCHAR(50) DEFAULT 'nouveau' CHECK (statut IN (
        'nouveau', 
        'vu', 
        'en_traitement', 
        'devis_envoye', 
        'accepte', 
        'refuse', 
        'termine',
        'archive'
    )),
    
    -- Emails
    email_client_envoye BOOLEAN DEFAULT FALSE,
    email_client_date TIMESTAMP WITH TIME ZONE,
    email_entreprise_envoye BOOLEAN DEFAULT FALSE,
    email_entreprise_date TIMESTAMP WITH TIME ZONE,
    
    -- Métadonnées
    source VARCHAR(50) DEFAULT 'calculatrice',
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: devis_meubles (Meubles sélectionnés par devis)
-- =====================================================
CREATE TABLE IF NOT EXISTS devis_meubles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    devis_id UUID REFERENCES devis(id) ON DELETE CASCADE,
    meuble_id UUID REFERENCES meubles(id) ON DELETE SET NULL,
    meuble_nom VARCHAR(255) NOT NULL,
    meuble_categorie VARCHAR(100),
    quantite INTEGER NOT NULL DEFAULT 1 CHECK (quantite > 0),
    volume_unitaire_m3 DECIMAL(5,2) NOT NULL,
    poids_unitaire_kg DECIMAL(6,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vue pour volume total calculé
CREATE OR REPLACE VIEW devis_meubles_totaux AS
SELECT 
    devis_id,
    SUM(quantite * volume_unitaire_m3) as volume_total,
    SUM(quantite * COALESCE(poids_unitaire_kg, 0)) as poids_total,
    SUM(quantite) as nombre_total
FROM devis_meubles
GROUP BY devis_id;

-- =====================================================
-- TABLE: notifications (Notifications système)
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    titre VARCHAR(255) NOT NULL,
    message TEXT,
    lien TEXT,
    lu BOOLEAN DEFAULT FALSE,
    lu_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: configurations_plateforme (Config admin)
-- =====================================================
CREATE TABLE IF NOT EXISTS configurations_plateforme (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cle VARCHAR(100) UNIQUE NOT NULL,
    valeur TEXT,
    type VARCHAR(50) DEFAULT 'string',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: logs_activite (Journalisation)
-- =====================================================
CREATE TABLE IF NOT EXISTS logs_activite (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    entreprise_id UUID REFERENCES entreprises(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entite VARCHAR(100),
    entite_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEX pour performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_entreprises_slug ON entreprises(slug);
CREATE INDEX IF NOT EXISTS idx_entreprises_user ON entreprises(user_id);
CREATE INDEX IF NOT EXISTS idx_entreprises_actif ON entreprises(actif);
CREATE INDEX IF NOT EXISTS idx_clients_entreprise ON clients(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_devis_entreprise ON devis(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_devis_client ON devis(client_id);
CREATE INDEX IF NOT EXISTS idx_devis_statut ON devis(statut);
CREATE INDEX IF NOT EXISTS idx_devis_created ON devis(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_devis_numero ON devis(numero);
CREATE INDEX IF NOT EXISTS idx_meubles_categorie ON meubles(categorie_id);
CREATE INDEX IF NOT EXISTS idx_meubles_actif ON meubles(actif);
CREATE INDEX IF NOT EXISTS idx_devis_meubles_devis ON devis_meubles(devis_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, lu);
CREATE INDEX IF NOT EXISTS idx_logs_user ON logs_activite(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_entreprise ON logs_activite(entreprise_id);

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour générer un numéro de devis unique
CREATE OR REPLACE FUNCTION generate_devis_numero()
RETURNS TRIGGER AS $$
DECLARE
    year_part VARCHAR(4);
    sequence_num INTEGER;
    new_numero VARCHAR(50);
BEGIN
    year_part := TO_CHAR(NOW(), 'YYYY');
    
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(numero FROM 'DEV-\d{4}-(\d+)') AS INTEGER)
    ), 0) + 1
    INTO sequence_num
    FROM devis
    WHERE numero LIKE 'DEV-' || year_part || '-%';
    
    new_numero := 'DEV-' || year_part || '-' || LPAD(sequence_num::TEXT, 5, '0');
    NEW.numero := new_numero;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer le numéro de devis
DROP TRIGGER IF EXISTS trigger_generate_devis_numero ON devis;
CREATE TRIGGER trigger_generate_devis_numero
    BEFORE INSERT ON devis
    FOR EACH ROW
    WHEN (NEW.numero IS NULL)
    EXECUTE FUNCTION generate_devis_numero();

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entreprises_updated_at BEFORE UPDATE ON entreprises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories_meubles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meubles_updated_at BEFORE UPDATE ON meubles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devis_updated_at BEFORE UPDATE ON devis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_config_updated_at BEFORE UPDATE ON configurations_plateforme
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE entreprises ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE devis ENABLE ROW LEVEL SECURITY;
ALTER TABLE devis_meubles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Note: Les policies RLS seront ajoutées après la configuration 
-- de l'authentification Supabase

-- =====================================================
-- COMMENTAIRES SUR LES TABLES
-- =====================================================
COMMENT ON TABLE users IS 'Utilisateurs de la plateforme (admin, entreprise, client)';
COMMENT ON TABLE entreprises IS 'Entreprises de déménagement inscrites sur la plateforme';
COMMENT ON TABLE categories_meubles IS 'Catégories de meubles (Salon, Cuisine, Chambre, etc.)';
COMMENT ON TABLE meubles IS 'Catalogue de meubles avec volume et poids';
COMMENT ON TABLE clients IS 'Clients des entreprises de déménagement';
COMMENT ON TABLE devis IS 'Demandes de devis générées via la calculatrice';
COMMENT ON TABLE devis_meubles IS 'Détail des meubles sélectionnés pour chaque devis';
COMMENT ON TABLE notifications IS 'Notifications système pour les utilisateurs';
COMMENT ON TABLE configurations_plateforme IS 'Configurations globales de la plateforme';
COMMENT ON TABLE logs_activite IS 'Journal des activités pour audit';

-- =====================================================
-- FIN DE LA MIGRATION INITIALE
-- =====================================================








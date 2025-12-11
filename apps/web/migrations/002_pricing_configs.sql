-- Migration pour ajouter les tables de tarification

-- Table des configurations de tarification
CREATE TABLE IF NOT EXISTS pricing_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entreprise_id UUID REFERENCES entreprises(id) ON DELETE CASCADE,
    tarif_base_m3 DECIMAL(10,2) NOT NULL DEFAULT 25.00,
    tarif_minimum DECIMAL(10,2) NOT NULL DEFAULT 150.00,
    majoration_etage DECIMAL(10,2) NOT NULL DEFAULT 10.00,
    majoration_sans_ascenseur DECIMAL(10,2) NOT NULL DEFAULT 30.00,
    frais_kilometrique DECIMAL(10,2) NOT NULL DEFAULT 1.50,
    distance_incluse DECIMAL(10,2) NOT NULL DEFAULT 50.00,
    tva DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    actif BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter les colonnes de prix dans la table devis
ALTER TABLE devis ADD COLUMN IF NOT EXISTS montant_estime DECIMAL(10,2);
ALTER TABLE devis ADD COLUMN IF NOT EXISTS devise VARCHAR(10) DEFAULT 'EUR';
ALTER TABLE devis ADD COLUMN IF NOT EXISTS details_prix TEXT;

-- Ajouter les colonnes d'étage dans la table devis
ALTER TABLE devis ADD COLUMN IF NOT EXISTS etage_depart INTEGER;
ALTER TABLE devis ADD COLUMN IF NOT EXISTS etage_arrivee INTEGER;

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_pricing_configs_entreprise ON pricing_configs(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_pricing_configs_actif ON pricing_configs(actif);

-- Insérer une configuration par défaut pour les entreprises existantes
INSERT INTO pricing_configs (entreprise_id, tarif_base_m3, tarif_minimum, majoration_etage, majoration_sans_ascenseur, frais_kilometrique, distance_incluse, tva, actif)
SELECT 
    id, 
    25.00, 
    150.00, 
    10.00, 
    30.00, 
    1.50, 
    50.00, 
    20.00, 
    true
FROM entreprises 
WHERE id NOT IN (SELECT entreprise_id FROM pricing_configs WHERE entreprise_id IS NOT NULL);
-- Migration pour ajouter le champ nombre_demenageurs dans la table devis

ALTER TABLE devis ADD COLUMN IF NOT EXISTS nombre_demenageurs INTEGER;

-- Commentaire pour documentation
COMMENT ON COLUMN devis.nombre_demenageurs IS 'Nombre de déménageurs nécessaires pour ce devis';









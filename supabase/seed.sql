-- =====================================================
-- MOOVELABS CRM DÉMÉNAGEMENT
-- Données Initiales (Seed)
-- =====================================================

-- =====================================================
-- CATÉGORIES DE MEUBLES
-- =====================================================
INSERT INTO categories_meubles (nom, nom_affichage, ordre, couleur) VALUES
('salon', 'SALON', 1, '#1e3a5f'),
('cuisine', 'CUISINE', 2, '#2563eb'),
('chambre', 'CHAMBRE', 3, '#7c3aed'),
('exterieur', 'EXTERIEUR', 4, '#059669'),
('carton', 'CARTONS', 5, '#d97706')
ON CONFLICT (nom) DO UPDATE SET
    nom_affichage = EXCLUDED.nom_affichage,
    ordre = EXCLUDED.ordre,
    couleur = EXCLUDED.couleur;

-- =====================================================
-- MEUBLES - SALON
-- =====================================================
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

-- =====================================================
-- MEUBLES - CUISINE
-- =====================================================
INSERT INTO meubles (categorie_id, nom, volume_m3, poids_kg, image_url, ordre) VALUES
((SELECT id FROM categories_meubles WHERE nom = 'cuisine'), 'Lave vaisselle', 0.8, 12, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736096061616x672044287679901000/Lave%20vaisselle.webp', 1),
((SELECT id FROM categories_meubles WHERE nom = 'cuisine'), 'Cuisinière', 0.8, 30, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736096341411x282923771715384300/Cuisini%C3%A8re.webp', 2),
((SELECT id FROM categories_meubles WHERE nom = 'cuisine'), 'Micro-ondes', 0.2, 12, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736096486314x286882568280442100/Micro-ondes.webp', 3),
((SELECT id FROM categories_meubles WHERE nom = 'cuisine'), 'Frigo standard', 1.8, 80, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736096658859x427612531134093060/Frigo%20standard.webp', 4),
((SELECT id FROM categories_meubles WHERE nom = 'cuisine'), 'Machine à laver', 0.8, 70, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736096721835x916609380057913600/Machine%20%C3%A0%20laver.webp', 5),
((SELECT id FROM categories_meubles WHERE nom = 'cuisine'), 'Frigo américain', 2.0, 115, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736096834563x250757391156319880/Frigo%20am%C3%A9ricain.webp', 6),
((SELECT id FROM categories_meubles WHERE nom = 'cuisine'), 'Petit vaisselier', 1.2, 65, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736096908987x238402032729279300/Petit%20vaisselier.webp', 7),
((SELECT id FROM categories_meubles WHERE nom = 'cuisine'), 'Grand vaisselier', 2.0, 135, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736097046897x740223435676885100/Grand%20vaisselier.webp', 8);

-- =====================================================
-- MEUBLES - CHAMBRE
-- =====================================================
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

-- =====================================================
-- MEUBLES - EXTERIEUR
-- =====================================================
INSERT INTO meubles (categorie_id, nom, volume_m3, poids_kg, image_url, ordre) VALUES
((SELECT id FROM categories_meubles WHERE nom = 'exterieur'), 'Vélo adulte', 1.0, 7, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736098484781x444933831702661000/V%C3%A9lo%20adulte.webp', 1),
((SELECT id FROM categories_meubles WHERE nom = 'exterieur'), 'Tondeuse', 0.4, 16, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736098597290x517570108468452740/Tondeuse.webp', 2),
((SELECT id FROM categories_meubles WHERE nom = 'exterieur'), 'Banc exterieur', 1.5, 25, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736098649057x445284535417335360/Banc%20exterieur.webp', 3),
((SELECT id FROM categories_meubles WHERE nom = 'exterieur'), 'Table de ping-pong', 1.8, 60, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736098696850x317627912746737400/Table%20de%20ping-pong.webp', 4),
((SELECT id FROM categories_meubles WHERE nom = 'exterieur'), 'Parasol', 0.5, 40, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736098748061x194110665624281700/Parasol.webp', 5),
((SELECT id FROM categories_meubles WHERE nom = 'exterieur'), 'Panier de basket', 0.7, 45, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736098829232x565134825605674940/Panier%20de%20basket.webp', 6),
((SELECT id FROM categories_meubles WHERE nom = 'exterieur'), 'Chaise de jardin', 0.5, 4, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736098897472x505632258183601000/Chaise%20de%20jardin.webp', 7),
((SELECT id FROM categories_meubles WHERE nom = 'exterieur'), 'Table de jardin', 1.3, 25, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736098962041x309633254904936500/Table%20de%20jardin.webp', 8);

-- =====================================================
-- MEUBLES - CARTONS
-- =====================================================
INSERT INTO meubles (categorie_id, nom, volume_m3, poids_kg, image_url, ordre) VALUES
((SELECT id FROM categories_meubles WHERE nom = 'carton'), 'Carton standard', 0.3, 10, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736097182885x342887467343209200/Carton%20standard.webp', 1),
((SELECT id FROM categories_meubles WHERE nom = 'carton'), 'Petit carton', 0.2, 5, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1736097215890x606574224422563000/Petit%20carton.webp', 2),
((SELECT id FROM categories_meubles WHERE nom = 'carton'), 'Carton penderie', 0.7, 10, 'https://d8f2ed535315c7d97df310dce5132399.cdn.bubble.io/f1737365868354x511525886960984000/Carton%20penderie.jpg', 3);

-- =====================================================
-- CONFIGURATIONS INITIALES DE LA PLATEFORME
-- =====================================================
INSERT INTO configurations_plateforme (cle, valeur, type, description) VALUES
('nom_plateforme', 'Moovelabs', 'string', 'Nom de la plateforme'),
('email_support', 'support@moovelabs.com', 'string', 'Email de support'),
('version', '1.0.0', 'string', 'Version actuelle de la plateforme'),
('maintenance_mode', 'false', 'boolean', 'Mode maintenance activé'),
('inscription_ouverte', 'true', 'boolean', 'Inscriptions ouvertes aux nouvelles entreprises'),
('max_meubles_par_devis', '100', 'number', 'Nombre maximum de meubles par devis'),
('delai_conservation_devis', '365', 'number', 'Nombre de jours de conservation des devis'),
('email_from_name', 'Moovelabs', 'string', 'Nom expéditeur des emails'),
('email_from_address', 'noreply@moovelabs.com', 'string', 'Adresse email expéditeur')
ON CONFLICT (cle) DO UPDATE SET
    valeur = EXCLUDED.valeur,
    updated_at = NOW();

-- =====================================================
-- UTILISATEUR ADMIN INITIAL (à modifier après création)
-- =====================================================
-- Note: Le mot de passe sera géré par Supabase Auth
-- Cet utilisateur est créé pour référence

INSERT INTO users (email, role, nom, prenom, email_verified)
VALUES ('admin@moovelabs.com', 'admin', 'Admin', 'Moovelabs', true)
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- ENTREPRISE DE DÉMONSTRATION
-- =====================================================
INSERT INTO entreprises (
    user_id,
    nom,
    email,
    telephone,
    adresse,
    code_postal,
    ville,
    pays,
    slug,
    couleur_primaire,
    couleur_secondaire,
    couleur_accent,
    actif,
    plan
) VALUES (
    (SELECT id FROM users WHERE email = 'admin@moovelabs.com'),
    'VSR Déménagement',
    'contact@vsr-demenagement.ch',
    '+41 21 123 45 67',
    'Rue du Commerce 15',
    '1003',
    'Lausanne',
    'Suisse',
    'vsr-demenagement',
    '#1e3a5f',
    '#2563eb',
    '#dc2626',
    true,
    'pro'
) ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- FIN DES DONNÉES INITIALES
-- =====================================================

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Seed data inserted successfully!';
    RAISE NOTICE 'Categories: %', (SELECT COUNT(*) FROM categories_meubles);
    RAISE NOTICE 'Meubles: %', (SELECT COUNT(*) FROM meubles);
    RAISE NOTICE 'Users: %', (SELECT COUNT(*) FROM users);
    RAISE NOTICE 'Entreprises: %', (SELECT COUNT(*) FROM entreprises);
END $$;




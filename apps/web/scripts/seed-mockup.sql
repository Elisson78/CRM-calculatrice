-- Dados Mockup para empresa mv@gmail.com
-- Empresa ID: 8e8de640-422e-4f73-aed1-ea7a1f3e22cd

-- Inserir devis de teste com diferentes status e datas
INSERT INTO devis (
  entreprise_id, client_nom, client_email, client_telephone,
  adresse_depart, avec_ascenseur_depart, adresse_arrivee, avec_ascenseur_arrivee,
  date_demenagement, volume_total_m3, poids_total_kg, nombre_meubles,
  statut, source, created_at
) VALUES
-- Devis nouveau (hoje)
('8e8de640-422e-4f73-aed1-ea7a1f3e22cd', 'Jean Dupont', 'jean.dupont@email.com', '+41 79 123 45 67',
 '15 Rue de Genève, 1003 Lausanne', true, '28 Avenue de la Gare, 1005 Lausanne', false,
 CURRENT_DATE + INTERVAL '15 days', 12.5, 450, 18,
 'nouveau', 'calculatrice', NOW()),

-- Devis nouveau (ontem)
('8e8de640-422e-4f73-aed1-ea7a1f3e22cd', 'Marie Martin', 'marie.martin@gmail.com', '+41 78 234 56 78',
 '42 Chemin des Roses, 1006 Lausanne', false, '8 Rue du Lac, 1800 Vevey', true,
 CURRENT_DATE + INTERVAL '20 days', 25.8, 820, 35,
 'nouveau', 'calculatrice', NOW() - INTERVAL '1 day'),

-- Devis vu
('8e8de640-422e-4f73-aed1-ea7a1f3e22cd', 'Pierre Schneider', 'p.schneider@outlook.com', '+41 76 345 67 89',
 '5 Place de la Riponne, 1005 Lausanne', true, '19 Rue Centrale, 1110 Morges', true,
 CURRENT_DATE + INTERVAL '10 days', 18.2, 580, 24,
 'vu', 'calculatrice', NOW() - INTERVAL '2 days'),

-- Devis en traitement
('8e8de640-422e-4f73-aed1-ea7a1f3e22cd', 'Sophie Bernard', 'sophie.b@hotmail.com', '+41 79 456 78 90',
 '33 Avenue de Cour, 1007 Lausanne', true, '7 Chemin du Bois, 1012 Pully', false,
 CURRENT_DATE + INTERVAL '8 days', 32.5, 1050, 42,
 'en_traitement', 'calculatrice', NOW() - INTERVAL '3 days'),

-- Devis devis_envoye
('8e8de640-422e-4f73-aed1-ea7a1f3e22cd', 'Lucas Weber', 'lucas.weber@bluewin.ch', '+41 78 567 89 01',
 '11 Rue de Bourg, 1003 Lausanne', false, '25 Avenue des Alpes, 1820 Montreux', true,
 CURRENT_DATE + INTERVAL '25 days', 45.0, 1450, 58,
 'devis_envoye', 'calculatrice', NOW() - INTERVAL '5 days'),

-- Devis accepte (semana passada)
('8e8de640-422e-4f73-aed1-ea7a1f3e22cd', 'Emma Favre', 'emma.favre@gmail.com', '+41 76 678 90 12',
 '9 Rue de la Louve, 1003 Lausanne', true, '14 Route de Berne, 1010 Lausanne', true,
 CURRENT_DATE + INTERVAL '5 days', 15.8, 520, 22,
 'accepte', 'calculatrice', NOW() - INTERVAL '7 days'),

-- Devis accepte (2 semanas atrás)
('8e8de640-422e-4f73-aed1-ea7a1f3e22cd', 'Thomas Roth', 'thomas.roth@sunrise.ch', '+41 79 789 01 23',
 '22 Chemin de Mornex, 1003 Lausanne', false, '6 Rue du Simplon, 1020 Renens', false,
 CURRENT_DATE - INTERVAL '5 days', 28.3, 890, 38,
 'accepte', 'calculatrice', NOW() - INTERVAL '14 days'),

-- Devis termine (concluído)
('8e8de640-422e-4f73-aed1-ea7a1f3e22cd', 'Julie Blanc', 'julie.blanc@email.ch', '+41 78 890 12 34',
 '17 Avenue du Théâtre, 1005 Lausanne', true, '3 Rue du Petit-Chêne, 1003 Lausanne', true,
 CURRENT_DATE - INTERVAL '10 days', 8.5, 280, 12,
 'termine', 'calculatrice', NOW() - INTERVAL '20 days'),

-- Devis termine (concluído mês passado)
('8e8de640-422e-4f73-aed1-ea7a1f3e22cd', 'Nicolas Muller', 'n.muller@gmail.com', '+41 76 901 23 45',
 '30 Boulevard de Grancy, 1006 Lausanne', false, '12 Avenue de Rumine, 1005 Lausanne', true,
 CURRENT_DATE - INTERVAL '25 days', 22.0, 720, 30,
 'termine', 'calculatrice', NOW() - INTERVAL '30 days'),

-- Devis refuse
('8e8de640-422e-4f73-aed1-ea7a1f3e22cd', 'Antoine Girard', 'antoine.g@yahoo.fr', '+41 79 012 34 56',
 '8 Rue Marterey, 1005 Lausanne', true, '45 Route de Chavannes, 1007 Lausanne', false,
 CURRENT_DATE + INTERVAL '12 days', 35.0, 1100, 45,
 'refuse', 'calculatrice', NOW() - INTERVAL '10 days'),

-- Mais devis para estatísticas (mês atual)
('8e8de640-422e-4f73-aed1-ea7a1f3e22cd', 'Claire Bonvin', 'claire.bonvin@swisscom.ch', '+41 78 123 45 00',
 '21 Rue de la Pontaise, 1018 Lausanne', false, '9 Avenue de Provence, 1007 Lausanne', true,
 CURRENT_DATE + INTERVAL '18 days', 19.5, 620, 26,
 'nouveau', 'calculatrice', NOW() - INTERVAL '1 day'),

('8e8de640-422e-4f73-aed1-ea7a1f3e22cd', 'David Rochat', 'david.rochat@bluewin.ch', '+41 76 234 56 00',
 '14 Chemin de Montelly, 1007 Lausanne', true, '28 Rue de Genève, 1004 Lausanne', false,
 CURRENT_DATE + INTERVAL '22 days', 14.2, 460, 19,
 'vu', 'calculatrice', NOW() - INTERVAL '3 days'),

('8e8de640-422e-4f73-aed1-ea7a1f3e22cd', 'Isabelle Meyer', 'i.meyer@gmail.com', '+41 79 345 67 00',
 '7 Avenue de Beaulieu, 1004 Lausanne', true, '16 Chemin des Vignes, 1012 Pully', true,
 CURRENT_DATE + INTERVAL '30 days', 38.0, 1200, 50,
 'en_traitement', 'calculatrice', NOW() - INTERVAL '4 days'),

-- Devis do mês passado para comparação
('8e8de640-422e-4f73-aed1-ea7a1f3e22cd', 'François Lehmann', 'f.lehmann@hotmail.com', '+41 78 456 78 00',
 '25 Rue de Lausanne, 1800 Vevey', false, '11 Avenue de la Gare, 1003 Lausanne', true,
 CURRENT_DATE - INTERVAL '35 days', 20.5, 680, 28,
 'termine', 'calculatrice', NOW() - INTERVAL '45 days'),

('8e8de640-422e-4f73-aed1-ea7a1f3e22cd', 'Nathalie Chevalier', 'nathalie.c@sunrise.ch', '+41 76 567 89 00',
 '3 Place du Tunnel, 1005 Lausanne', true, '20 Rue du Maupas, 1004 Lausanne', false,
 CURRENT_DATE - INTERVAL '40 days', 16.8, 540, 23,
 'termine', 'calculatrice', NOW() - INTERVAL '50 days');

-- Inserir alguns meubles nos devis criados
-- Vamos pegar os IDs dos devis criados e adicionar meubles
DO $$
DECLARE
    devis_record RECORD;
BEGIN
    FOR devis_record IN 
        SELECT id, volume_total_m3 FROM devis 
        WHERE entreprise_id = '8e8de640-422e-4f73-aed1-ea7a1f3e22cd'
        ORDER BY created_at DESC
        LIMIT 15
    LOOP
        -- Adicionar alguns meubles padrão para cada devis
        INSERT INTO devis_meubles (devis_id, meuble_nom, meuble_categorie, quantite, volume_unitaire_m3, poids_unitaire_kg)
        VALUES 
            (devis_record.id, 'Canapé 3 places', 'Salon', 1, 1.5, 80),
            (devis_record.id, 'Table basse', 'Salon', 1, 0.3, 15),
            (devis_record.id, 'Lit double', 'Chambre', 1, 2.0, 100),
            (devis_record.id, 'Armoire 2 portes', 'Chambre', 1, 1.8, 90),
            (devis_record.id, 'Table à manger', 'Salle à manger', 1, 0.8, 40),
            (devis_record.id, 'Chaise', 'Salle à manger', 4, 0.15, 5),
            (devis_record.id, 'Bureau', 'Bureau', 1, 0.6, 30),
            (devis_record.id, 'Carton standard', 'Cartons', 10, 0.06, 15),
            (devis_record.id, 'Réfrigérateur', 'Cuisine', 1, 0.8, 70),
            (devis_record.id, 'Machine à laver', 'Électroménager', 1, 0.5, 65);
    END LOOP;
END $$;





-- ============================================
-- INSERTION DE DONNÉES D'EXEMPLE
-- LycéeConnect - Plateforme RBDE
-- ============================================

-- ============================================
-- DONNÉES DE RÉFÉRENCE
-- ============================================

-- Insertion des régions
INSERT INTO "Region" (nom) VALUES 
('Auvergne-Rhône-Alpes'),
('Bourgogne-Franche-Comté'),
('Bretagne'),
('Centre-Val de Loire'),
('Corse'),
('Grand Est'),
('Hauts-de-France'),
('Île-de-France'),
('Normandie'),
('Nouvelle-Aquitaine'),
('Occitanie'),
('Pays de la Loire'),
('Provence-Alpes-Côte d''Azur');

-- Insertion des domaines d'activité
INSERT INTO "Domaine" (nom) VALUES 
('Commerce et vente'),
('Industrie et production'),
('Informatique et numérique'),
('Bâtiment et travaux publics'),
('Restauration et hôtellerie'),
('Transport et logistique'),
('Santé et social'),
('Agriculture et environnement'),
('Arts et artisanat'),
('Services à la personne');

-- Insertion des métiers
INSERT INTO "Metier" (nom, domaine_id) VALUES 
-- Commerce et vente
('Vendeur conseil', (SELECT id FROM "Domaine" WHERE nom = 'Commerce et vente')),
('Attaché commercial', (SELECT id FROM "Domaine" WHERE nom = 'Commerce et vente')),
('Manager de rayon', (SELECT id FROM "Domaine" WHERE nom = 'Commerce et vente')),

-- Industrie et production
('Technicien de maintenance', (SELECT id FROM "Domaine" WHERE nom = 'Industrie et production')),
('Opérateur de production', (SELECT id FROM "Domaine" WHERE nom = 'Industrie et production')),
('Contrôleur qualité', (SELECT id FROM "Domaine" WHERE nom = 'Industrie et production')),

-- Informatique et numérique
('Développeur web', (SELECT id FROM "Domaine" WHERE nom = 'Informatique et numérique')),
('Technicien informatique', (SELECT id FROM "Domaine" WHERE nom = 'Informatique et numérique')),
('Administrateur réseau', (SELECT id FROM "Domaine" WHERE nom = 'Informatique et numérique')),

-- Bâtiment et travaux publics
('Maçon', (SELECT id FROM "Domaine" WHERE nom = 'Bâtiment et travaux publics')),
('Électricien', (SELECT id FROM "Domaine" WHERE nom = 'Bâtiment et travaux publics')),
('Plombier', (SELECT id FROM "Domaine" WHERE nom = 'Bâtiment et travaux publics')),

-- Restauration et hôtellerie
('Cuisinier', (SELECT id FROM "Domaine" WHERE nom = 'Restauration et hôtellerie')),
('Serveur', (SELECT id FROM "Domaine" WHERE nom = 'Restauration et hôtellerie')),
('Réceptionniste', (SELECT id FROM "Domaine" WHERE nom = 'Restauration et hôtellerie'));

-- ============================================
-- LYCÉES D'EXEMPLE
-- ============================================

-- Insertion de lycées d'exemple
INSERT INTO "Lycee" (nom, adresse, region_id, description, site_web) VALUES 
(
  'Lycée professionnel Pierre Mendès France',
  '88 Rue de Paris, 59000 Lille',
  (SELECT id FROM "Region" WHERE nom = 'Hauts-de-France'),
  'Lycée spécialisé dans les métiers du commerce et de l''industrie',
  'https://mendes-france-lille.fr'
),
(
  'Lycée professionnel Jean Moulin',
  '25 Avenue de la République, 69001 Lyon',
  (SELECT id FROM "Region" WHERE nom = 'Auvergne-Rhône-Alpes'),
  'Formation en BTP et électricité',
  'https://jean-moulin-lyon.fr'
),
(
  'Lycée professionnel Marie Curie',
  '15 Rue des Sciences, 75013 Paris',
  (SELECT id FROM "Region" WHERE nom = 'Île-de-France'),
  'Spécialisé en informatique et numérique',
  'https://marie-curie-paris.fr'
);

-- ============================================
-- FORMATIONS D'EXEMPLE
-- ============================================

-- Formations pour le lycée Mendès France (Commerce/Industrie)
INSERT INTO "Formation" (lycee_id, intitule, domaine_id, metier_id, modalite) VALUES 
(
  (SELECT id FROM "Lycee" WHERE nom = 'Lycée professionnel Pierre Mendès France'),
  'Bac Pro Commerce',
  (SELECT id FROM "Domaine" WHERE nom = 'Commerce et vente'),
  (SELECT id FROM "Metier" WHERE nom = 'Vendeur conseil'),
  'Alternance'
),
(
  (SELECT id FROM "Lycee" WHERE nom = 'Lycée professionnel Pierre Mendès France'),
  'Bac Pro Maintenance des équipements industriels',
  (SELECT id FROM "Domaine" WHERE nom = 'Industrie et production'),
  (SELECT id FROM "Metier" WHERE nom = 'Technicien de maintenance'),
  'Alternance'
);

-- Formations pour le lycée Jean Moulin (BTP)
INSERT INTO "Formation" (lycee_id, intitule, domaine_id, metier_id, modalite) VALUES 
(
  (SELECT id FROM "Lycee" WHERE nom = 'Lycée professionnel Jean Moulin'),
  'CAP Maçon',
  (SELECT id FROM "Domaine" WHERE nom = 'Bâtiment et travaux publics'),
  (SELECT id FROM "Metier" WHERE nom = 'Maçon'),
  'Alternance'
),
(
  (SELECT id FROM "Lycee" WHERE nom = 'Lycée professionnel Jean Moulin'),
  'Bac Pro MELEC (Métiers de l''électricité)',
  (SELECT id FROM "Domaine" WHERE nom = 'Bâtiment et travaux publics'),
  (SELECT id FROM "Metier" WHERE nom = 'Électricien'),
  'Alternance'
);

-- Formations pour le lycée Marie Curie (Informatique)
INSERT INTO "Formation" (lycee_id, intitule, domaine_id, metier_id, modalite) VALUES 
(
  (SELECT id FROM "Lycee" WHERE nom = 'Lycée professionnel Marie Curie'),
  'BTS SIO (Services informatiques aux organisations)',
  (SELECT id FROM "Domaine" WHERE nom = 'Informatique et numérique'),
  (SELECT id FROM "Metier" WHERE nom = 'Développeur web'),
  'Alternance'
),
(
  (SELECT id FROM "Lycee" WHERE nom = 'Lycée professionnel Marie Curie'),
  'Bac Pro SN (Systèmes numériques)',
  (SELECT id FROM "Domaine" WHERE nom = 'Informatique et numérique'),
  (SELECT id FROM "Metier" WHERE nom = 'Technicien informatique'),
  'Stage'
);

-- ============================================
-- PLATEAUX TECHNIQUES D'EXEMPLE
-- ============================================

INSERT INTO "PlateauTechnique" (lycee_id, nom, description) VALUES 
(
  (SELECT id FROM "Lycee" WHERE nom = 'Lycée professionnel Pierre Mendès France'),
  'Magasin pédagogique',
  'Espace de vente reconstitué avec caisse et linéaires pour la formation commerce'
),
(
  (SELECT id FROM "Lycee" WHERE nom = 'Lycée professionnel Jean Moulin'),
  'Atelier BTP',
  'Plateau technique équipé pour la maçonnerie et les travaux de gros œuvre'
),
(
  (SELECT id FROM "Lycee" WHERE nom = 'Lycée professionnel Marie Curie'),
  'Laboratoire informatique',
  'Salle équipée de 30 postes avec serveur pour les formations en développement'
);

-- ============================================
-- UTILISATEURS D'EXEMPLE
-- ============================================

-- Mot de passe hashé pour "password123" (à des fins de démonstration)
INSERT INTO "User" (email, password_hash, role, full_name, lycee_id) VALUES 
(
  'rbde.mendes@education.gouv.fr',
  '$2b$10$EQQ3xGv7g9gM8WJ8vD9VZ.UxP5VuJN6M8fBz4KJ2L3K8Qs7N9R2P6',
  'rbde',
  'Sophie Dubois',
  (SELECT id FROM "Lycee" WHERE nom = 'Lycée professionnel Pierre Mendès France')
),
(
  'rbde.moulin@education.gouv.fr',
  '$2b$10$EQQ3xGv7g9gM8WJ8vD9VZ.UxP5VuJN6M8fBz4KJ2L3K8Qs7N9R2P6',
  'rbde',
  'Marc Martin',
  (SELECT id FROM "Lycee" WHERE nom = 'Lycée professionnel Jean Moulin')
),
(
  'admin@lyceeconnect.fr',
  '$2b$10$EQQ3xGv7g9gM8WJ8vD9VZ.UxP5VuJN6M8fBz4KJ2L3K8Qs7N9R2P6',
  'admin',
  'Administrateur Système',
  NULL
);

-- ============================================
-- ENTREPRISES D'EXEMPLE
-- ============================================

INSERT INTO "Entreprise" (nom, siret, secteur, adresse) VALUES 
('TechSolutions SARL', '12345678901234', 'Informatique', '123 Rue de la Tech, 75001 Paris'),
('BatiPro SAS', '23456789012345', 'BTP', '456 Avenue du Bâtiment, 69002 Lyon'),
('CommerceMax', '34567890123456', 'Commerce', '789 Boulevard du Commerce, 59000 Lille');

-- ============================================
-- DEMANDES D'EXEMPLE
-- ============================================

INSERT INTO "Demande" (entreprise_id, metier_id, zone_geo, statut) VALUES 
(
  (SELECT id FROM "Entreprise" WHERE nom = 'TechSolutions SARL'),
  (SELECT id FROM "Metier" WHERE nom = 'Développeur web'),
  'Île-de-France',
  'en_attente'
),
(
  (SELECT id FROM "Entreprise" WHERE nom = 'BatiPro SAS'),
  (SELECT id FROM "Metier" WHERE nom = 'Électricien'),
  'Auvergne-Rhône-Alpes',
  'en_cours'
);

-- ============================================
-- ATTRIBUTION DES DEMANDES AUX LYCÉES
-- ============================================

INSERT INTO "DemandeLycee" (demande_id, lycee_id, note, statut_traitement) VALUES 
(
  (SELECT d.id FROM "Demande" d 
   JOIN "Entreprise" e ON d.entreprise_id = e.id 
   WHERE e.nom = 'TechSolutions SARL'),
  (SELECT id FROM "Lycee" WHERE nom = 'Lycée professionnel Marie Curie'),
  'Demande pour 2 alternants en développement web',
  'nouveau'
),
(
  (SELECT d.id FROM "Demande" d 
   JOIN "Entreprise" e ON d.entreprise_id = e.id 
   WHERE e.nom = 'BatiPro SAS'),
  (SELECT id FROM "Lycee" WHERE nom = 'Lycée professionnel Jean Moulin'),
  'Besoin urgent d''un apprenti électricien',
  'en_cours'
);

-- ============================================
-- ACTIONS D'EXEMPLE
-- ============================================

INSERT INTO "Action" (demande_id, user_id, type_action, commentaire) VALUES 
(
  (SELECT d.id FROM "Demande" d 
   JOIN "Entreprise" e ON d.entreprise_id = e.id 
   WHERE e.nom = 'TechSolutions SARL'),
  (SELECT id FROM "User" WHERE email = 'rbde.moulin@education.gouv.fr'),
  'creation',
  'Demande créée et assignée automatiquement'
),
(
  (SELECT d.id FROM "Demande" d 
   JOIN "Entreprise" e ON d.entreprise_id = e.id 
   WHERE e.nom = 'BatiPro SAS'),
  (SELECT id FROM "User" WHERE email = 'rbde.moulin@education.gouv.fr'),
  'contact_entreprise',
  'Premier contact établi avec l''entreprise'
);

-- Fin de l'insertion des données d'exemple 
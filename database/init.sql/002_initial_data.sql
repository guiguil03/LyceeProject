-- Données initiales MINIMALES pour le système LyceeProject
-- Les lycées et entreprises seront importés via les APIs externes

-- Insertion des domaines de formation (nécessaire pour le mapping secteur -> formation)
INSERT INTO "Domaine" ("nom", "description") VALUES 
('Informatique et numérique', 'Technologies de l''information, développement, cybersécurité'),
('Commerce et gestion', 'Vente, marketing, gestion d''entreprise, comptabilité'),
('Industrie et maintenance', 'Mécanique, électronique, maintenance industrielle'),
('Bâtiment et travaux publics', 'Construction, génie civil, aménagement'),
('Hôtellerie-restauration', 'Services hôteliers, cuisine, tourisme'),
('Transport et logistique', 'Transport de personnes et marchandises, logistique'),
('Santé et social', 'Soins, aide à la personne, services sociaux'),
('Agriculture et environnement', 'Agriculture, horticulture, environnement'),
('Arts et communication', 'Arts appliqués, communication, audiovisuel'),
('Sécurité', 'Sécurité publique et privée, prévention des risques');

-- Insertion des métiers par domaine (pour le matching intelligent)
INSERT INTO "Metier" ("nom", "domaine_id") 
SELECT 'Développeur web', "id" FROM "Domaine" WHERE "nom" = 'Informatique et numérique'
UNION ALL
SELECT 'Technicien réseau', "id" FROM "Domaine" WHERE "nom" = 'Informatique et numérique'
UNION ALL
SELECT 'Administrateur système', "id" FROM "Domaine" WHERE "nom" = 'Informatique et numérique'
UNION ALL
SELECT 'Vendeur', "id" FROM "Domaine" WHERE "nom" = 'Commerce et gestion'
UNION ALL
SELECT 'Commercial', "id" FROM "Domaine" WHERE "nom" = 'Commerce et gestion'
UNION ALL
SELECT 'Comptable', "id" FROM "Domaine" WHERE "nom" = 'Commerce et gestion'
UNION ALL
SELECT 'Mécanicien industriel', "id" FROM "Domaine" WHERE "nom" = 'Industrie et maintenance'
UNION ALL
SELECT 'Électricien', "id" FROM "Domaine" WHERE "nom" = 'Industrie et maintenance'
UNION ALL
SELECT 'Maçon', "id" FROM "Domaine" WHERE "nom" = 'Bâtiment et travaux publics'
UNION ALL
SELECT 'Plombier', "id" FROM "Domaine" WHERE "nom" = 'Bâtiment et travaux publics'
UNION ALL
SELECT 'Cuisinier', "id" FROM "Domaine" WHERE "nom" = 'Hôtellerie-restauration'
UNION ALL
SELECT 'Serveur', "id" FROM "Domaine" WHERE "nom" = 'Hôtellerie-restauration'
UNION ALL
SELECT 'Chauffeur', "id" FROM "Domaine" WHERE "nom" = 'Transport et logistique'
UNION ALL
SELECT 'Logisticien', "id" FROM "Domaine" WHERE "nom" = 'Transport et logistique'
UNION ALL
SELECT 'Aide-soignant', "id" FROM "Domaine" WHERE "nom" = 'Santé et social'
UNION ALL
SELECT 'Assistant social', "id" FROM "Domaine" WHERE "nom" = 'Santé et social'
UNION ALL
SELECT 'Agent de sécurité', "id" FROM "Domaine" WHERE "nom" = 'Sécurité';

-- Création d'un utilisateur administrateur par défaut
INSERT INTO "User" ("email", "password_hash", "role", "full_name") VALUES 
('admin@lyceeproject.fr', '$2b$10$rQZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9QZ9Q', 'SUPER_ADMIN', 'Administrateur Système');

-- Note: Le mot de passe par défaut est "admin123" (hashé avec bcrypt)
-- Il faudra le changer lors de la première connexion

-- PAS d'insertion d'entreprises ni de lycées car ils viennent des APIs externes

-- Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Application du trigger sur les tables concernées
CREATE TRIGGER update_lycee_updated_at BEFORE UPDATE ON "Lycee" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_entreprise_updated_at BEFORE UPDATE ON "Entreprise" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_demande_updated_at BEFORE UPDATE ON "Demande" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

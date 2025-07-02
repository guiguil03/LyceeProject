-- ============================================
-- SCRIPT D'INITIALISATION DE LA BASE DE DONNÉES
-- LycéeConnect - Plateforme RBDE
-- ============================================

-- Extension pour générer des UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CRÉATION DES TABLES PRINCIPALES
-- ============================================

-- Table des régions
CREATE TABLE "Region" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "nom" varchar(255) NOT NULL UNIQUE
);

-- Table des domaines d'activité
CREATE TABLE "Domaine" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "nom" varchar(255) NOT NULL UNIQUE
);

-- Table des métiers
CREATE TABLE "Metier" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "nom" varchar(255) NOT NULL,
  "domaine_id" uuid NOT NULL
);

-- Table des lycées
CREATE TABLE "Lycee" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "nom" varchar(500) NOT NULL,
  "adresse" text,
  "region_id" uuid,
  "description" text,
  "site_web" varchar(500),
  "created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Table des utilisateurs
CREATE TABLE "User" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "email" varchar(255) UNIQUE NOT NULL,
  "password_hash" varchar(255) NOT NULL,
  "role" varchar(50) NOT NULL CHECK (role IN ('admin', 'rbde', 'entreprise')),
  "full_name" varchar(255),
  "lycee_id" uuid, -- Null si entreprise
  "created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Table des formations
CREATE TABLE "Formation" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "lycee_id" uuid NOT NULL,
  "intitule" varchar(500) NOT NULL,
  "domaine_id" uuid,
  "metier_id" uuid,
  "modalite" varchar(100) -- Alternance, stage, etc.
);

-- Table des plateaux techniques
CREATE TABLE "PlateauTechnique" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "lycee_id" uuid NOT NULL,
  "nom" varchar(255) NOT NULL,
  "description" text,
  "image_url" varchar(500)
);

-- Table des entreprises
CREATE TABLE "Entreprise" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "nom" varchar(500) NOT NULL,
  "siret" varchar(14) UNIQUE,
  "secteur" varchar(255),
  "adresse" text,
  "created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Table des demandes
CREATE TABLE "Demande" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "entreprise_id" uuid NOT NULL,
  "metier_id" uuid NOT NULL,
  "zone_geo" varchar(255),
  "statut" varchar(50) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'en_cours', 'traitee', 'fermee')),
  "date_creation" timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Table de liaison demande-lycée
CREATE TABLE "DemandeLycee" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "demande_id" uuid NOT NULL,
  "lycee_id" uuid NOT NULL,
  "note" text,
  "statut_traitement" varchar(50) DEFAULT 'nouveau' CHECK (statut_traitement IN ('nouveau', 'en_cours', 'accepte', 'refuse')),
  "date_affectation" timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Table des actions/historique
CREATE TABLE "Action" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "demande_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "type_action" varchar(100) NOT NULL,
  "commentaire" text,
  "date_action" timestamp DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CRÉATION DES CONTRAINTES DE CLÉS ÉTRANGÈRES
-- ============================================

-- Contraintes pour User
ALTER TABLE "User" ADD FOREIGN KEY ("lycee_id") REFERENCES "Lycee" ("id") ON DELETE SET NULL;

-- Contraintes pour Lycee
ALTER TABLE "Lycee" ADD FOREIGN KEY ("region_id") REFERENCES "Region" ("id") ON DELETE SET NULL;

-- Contraintes pour Formation
ALTER TABLE "Formation" ADD FOREIGN KEY ("lycee_id") REFERENCES "Lycee" ("id") ON DELETE CASCADE;
ALTER TABLE "Formation" ADD FOREIGN KEY ("domaine_id") REFERENCES "Domaine" ("id") ON DELETE SET NULL;
ALTER TABLE "Formation" ADD FOREIGN KEY ("metier_id") REFERENCES "Metier" ("id") ON DELETE SET NULL;

-- Contraintes pour PlateauTechnique
ALTER TABLE "PlateauTechnique" ADD FOREIGN KEY ("lycee_id") REFERENCES "Lycee" ("id") ON DELETE CASCADE;

-- Contraintes pour Demande
ALTER TABLE "Demande" ADD FOREIGN KEY ("entreprise_id") REFERENCES "Entreprise" ("id") ON DELETE CASCADE;
ALTER TABLE "Demande" ADD FOREIGN KEY ("metier_id") REFERENCES "Metier" ("id") ON DELETE RESTRICT;

-- Contraintes pour DemandeLycee
ALTER TABLE "DemandeLycee" ADD FOREIGN KEY ("demande_id") REFERENCES "Demande" ("id") ON DELETE CASCADE;
ALTER TABLE "DemandeLycee" ADD FOREIGN KEY ("lycee_id") REFERENCES "Lycee" ("id") ON DELETE CASCADE;

-- Contraintes pour Action
ALTER TABLE "Action" ADD FOREIGN KEY ("demande_id") REFERENCES "Demande" ("id") ON DELETE CASCADE;
ALTER TABLE "Action" ADD FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE;

-- Contraintes pour Metier
ALTER TABLE "Metier" ADD FOREIGN KEY ("domaine_id") REFERENCES "Domaine" ("id") ON DELETE CASCADE;

-- ============================================
-- CRÉATION DES INDEX POUR LES PERFORMANCES
-- ============================================

-- Index sur les colonnes fréquemment utilisées
CREATE INDEX idx_user_email ON "User" ("email");
CREATE INDEX idx_user_lycee ON "User" ("lycee_id");
CREATE INDEX idx_lycee_region ON "Lycee" ("region_id");
CREATE INDEX idx_formation_lycee ON "Formation" ("lycee_id");
CREATE INDEX idx_formation_metier ON "Formation" ("metier_id");
CREATE INDEX idx_demande_entreprise ON "Demande" ("entreprise_id");
CREATE INDEX idx_demande_statut ON "Demande" ("statut");
CREATE INDEX idx_demande_lycee_demande ON "DemandeLycee" ("demande_id");
CREATE INDEX idx_demande_lycee_lycee ON "DemandeLycee" ("lycee_id");
CREATE INDEX idx_action_demande ON "Action" ("demande_id");
CREATE INDEX idx_action_user ON "Action" ("user_id");

-- ============================================
-- COMMENTAIRES SUR LES TABLES
-- ============================================

COMMENT ON TABLE "User" IS 'Utilisateurs du système (RBDE, entreprises, admin)';
COMMENT ON COLUMN "User"."lycee_id" IS 'Null si utilisateur entreprise ou admin';
COMMENT ON TABLE "Lycee" IS 'Établissements scolaires professionnels';
COMMENT ON TABLE "Formation" IS 'Formations disponibles dans les lycées';
COMMENT ON TABLE "PlateauTechnique" IS 'Équipements et plateaux techniques des lycées';
COMMENT ON TABLE "Entreprise" IS 'Entreprises utilisatrices de la plateforme';
COMMENT ON TABLE "Demande" IS 'Demandes de mise en relation des entreprises';
COMMENT ON TABLE "DemandeLycee" IS 'Attribution des demandes aux lycées';
COMMENT ON TABLE "Action" IS 'Historique des actions sur les demandes';

-- Fin du script d'initialisation 
-- Script d'initialisation de la base de données LyceeProject
-- Basé sur version1.sql avec améliorations pour PostgreSQL

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des régions
CREATE TABLE "Region" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "nom" varchar(255) NOT NULL UNIQUE,
  "created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Table des domaines de formation
CREATE TABLE "Domaine" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "nom" varchar(255) NOT NULL UNIQUE,
  "description" text,
  "created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Table des métiers
CREATE TABLE "Metier" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "nom" varchar(255) NOT NULL,
  "domaine_id" uuid NOT NULL,
  "description" text,
  "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("domaine_id") REFERENCES "Domaine" ("id") ON DELETE CASCADE
);

-- Table des lycées
CREATE TABLE "Lycee" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "nom" varchar(255) NOT NULL,
  "numero_uai" varchar(20) UNIQUE, -- Numéro UAI officiel
  "type_etablissement" varchar(100),
  "statut_public_prive" varchar(20),
  "adresse" text NOT NULL,
  "code_postal" varchar(10),
  "commune" varchar(255),
  "departement" varchar(255),
  "region_id" uuid,
  "latitude" decimal(10, 8),
  "longitude" decimal(11, 8),
  "telephone" varchar(20),
  "email" varchar(255),
  "site_web" varchar(500),
  "description" text,
  "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("region_id") REFERENCES "Region" ("id") ON DELETE SET NULL
);

-- Table des formations
CREATE TABLE "Formation" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "lycee_id" uuid NOT NULL,
  "intitule" varchar(500) NOT NULL,
  "domaine_id" uuid,
  "metier_id" uuid,
  "niveau" varchar(50), -- CAP, BAC PRO, BTS, etc.
  "modalite" varchar(100), -- temps plein, apprentissage, etc.
  "duree_mois" integer,
  "description" text,
  "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("lycee_id") REFERENCES "Lycee" ("id") ON DELETE CASCADE,
  FOREIGN KEY ("domaine_id") REFERENCES "Domaine" ("id") ON DELETE SET NULL,
  FOREIGN KEY ("metier_id") REFERENCES "Metier" ("id") ON DELETE SET NULL
);

-- Table des plateaux techniques
CREATE TABLE "PlateauTechnique" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "lycee_id" uuid NOT NULL,
  "nom" varchar(255) NOT NULL,
  "description" text,
  "capacite_etudiants" integer,
  "equipements" text[], -- Array PostgreSQL pour liste d'équipements
  "image_url" varchar(500),
  "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("lycee_id") REFERENCES "Lycee" ("id") ON DELETE CASCADE
);

-- Table des entreprises
CREATE TABLE "Entreprise" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "nom" varchar(255) NOT NULL,
  "siret" varchar(14) UNIQUE,
  "siren" varchar(9),
  "secteur_activite" varchar(255),
  "code_naf" varchar(10),
  "adresse" text,
  "code_postal" varchar(10),
  "commune" varchar(255),
  "departement" varchar(255),
  "latitude" decimal(10, 8),
  "longitude" decimal(11, 8),
  "telephone" varchar(20),
  "email" varchar(255),
  "site_web" varchar(500),
  "effectif" varchar(50),
  "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Table des utilisateurs
CREATE TABLE "User" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "email" varchar(255) UNIQUE NOT NULL,
  "password_hash" varchar(255) NOT NULL,
  "role" varchar(50) NOT NULL DEFAULT 'USER', -- USER, LYCEE_ADMIN, ENTREPRISE_ADMIN, SUPER_ADMIN
  "full_name" varchar(255),
  "lycee_id" uuid, -- Null si entreprise ou super admin
  "entreprise_id" uuid, -- Null si lycée ou super admin  
  "is_active" boolean DEFAULT true,
  "last_login" timestamp,
  "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("lycee_id") REFERENCES "Lycee" ("id") ON DELETE SET NULL,
  FOREIGN KEY ("entreprise_id") REFERENCES "Entreprise" ("id") ON DELETE SET NULL
);

-- Table des demandes de partenariat
CREATE TABLE "Demande" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "entreprise_id" uuid NOT NULL,
  "metier_id" uuid,
  "titre" varchar(255) NOT NULL,
  "description" text,
  "type_partenariat" varchar(100), -- stage, apprentissage, visite, etc.
  "zone_geo" varchar(255),
  "nb_places" integer,
  "date_debut_souhaitee" date,
  "date_fin_souhaitee" date,
  "statut" varchar(50) DEFAULT 'EN_ATTENTE', -- EN_ATTENTE, EN_COURS, TRAITE, ANNULE
  "priorite" varchar(20) DEFAULT 'NORMALE', -- BASSE, NORMALE, HAUTE, URGENTE
  "date_creation" timestamp DEFAULT CURRENT_TIMESTAMP,
  "date_modification" timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("entreprise_id") REFERENCES "Entreprise" ("id") ON DELETE CASCADE,
  FOREIGN KEY ("metier_id") REFERENCES "Metier" ("id") ON DELETE SET NULL
);

-- Table de liaison demande-lycée
CREATE TABLE "DemandeLycee" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "demande_id" uuid NOT NULL,
  "lycee_id" uuid NOT NULL,
  "note" text,
  "statut_traitement" varchar(50) DEFAULT 'NOUVEAU', -- NOUVEAU, EN_COURS, ACCEPTE, REFUSE, EN_ATTENTE
  "score_matching" decimal(3,2), -- Score de 0.00 à 1.00
  "distance_km" decimal(6,2),
  "date_affectation" timestamp DEFAULT CURRENT_TIMESTAMP,
  "date_reponse" timestamp,
  "user_traitement_id" uuid, -- Utilisateur qui a traité
  FOREIGN KEY ("demande_id") REFERENCES "Demande" ("id") ON DELETE CASCADE,
  FOREIGN KEY ("lycee_id") REFERENCES "Lycee" ("id") ON DELETE CASCADE,
  FOREIGN KEY ("user_traitement_id") REFERENCES "User" ("id") ON DELETE SET NULL,
  UNIQUE("demande_id", "lycee_id")
);

-- Table des actions/historique
CREATE TABLE "Action" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "demande_id" uuid,
  "demande_lycee_id" uuid,
  "user_id" uuid NOT NULL,
  "type_action" varchar(100) NOT NULL, -- CREATION, AFFECTATION, COMMENTAIRE, STATUT_CHANGE, etc.
  "commentaire" text,
  "donnees_avant" jsonb, -- État avant modification (JSON)
  "donnees_apres" jsonb, -- État après modification (JSON)
  "date_action" timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("demande_id") REFERENCES "Demande" ("id") ON DELETE CASCADE,
  FOREIGN KEY ("demande_lycee_id") REFERENCES "DemandeLycee" ("id") ON DELETE CASCADE,
  FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE
);

-- Index pour améliorer les performances
CREATE INDEX idx_lycee_region ON "Lycee"("region_id");
CREATE INDEX idx_lycee_location ON "Lycee"("latitude", "longitude");
CREATE INDEX idx_lycee_uai ON "Lycee"("numero_uai");
CREATE INDEX idx_formation_lycee ON "Formation"("lycee_id");
CREATE INDEX idx_formation_domaine ON "Formation"("domaine_id");
CREATE INDEX idx_formation_metier ON "Formation"("metier_id");
CREATE INDEX idx_entreprise_siret ON "Entreprise"("siret");
CREATE INDEX idx_entreprise_location ON "Entreprise"("latitude", "longitude");
CREATE INDEX idx_demande_entreprise ON "Demande"("entreprise_id");
CREATE INDEX idx_demande_statut ON "Demande"("statut");
CREATE INDEX idx_demande_lycee_demande ON "DemandeLycee"("demande_id");
CREATE INDEX idx_demande_lycee_lycee ON "DemandeLycee"("lycee_id");
CREATE INDEX idx_demande_lycee_statut ON "DemandeLycee"("statut_traitement");
CREATE INDEX idx_action_demande ON "Action"("demande_id");
CREATE INDEX idx_action_user ON "Action"("user_id");
CREATE INDEX idx_action_type ON "Action"("type_action");
CREATE INDEX idx_action_date ON "Action"("date_action");

-- Commentaires pour documentation
COMMENT ON TABLE "User" IS 'Utilisateurs du système (lycées, entreprises, administrateurs)';
COMMENT ON COLUMN "User"."lycee_id" IS 'Null si utilisateur entreprise ou super admin';
COMMENT ON COLUMN "User"."entreprise_id" IS 'Null si utilisateur lycée ou super admin';
COMMENT ON TABLE "Demande" IS 'Demandes de partenariat émises par les entreprises';
COMMENT ON TABLE "DemandeLycee" IS 'Affectation des demandes aux lycées avec suivi du traitement';
COMMENT ON TABLE "Action" IS 'Historique de toutes les actions sur les demandes';
COMMENT ON COLUMN "DemandeLycee"."score_matching" IS 'Score de correspondance calculé automatiquement (0.00 à 1.00)';

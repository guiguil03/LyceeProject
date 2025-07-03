-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "nom" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Domaine" (
    "id" TEXT NOT NULL,
    "nom" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Domaine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Metier" (
    "id" TEXT NOT NULL,
    "nom" VARCHAR(255) NOT NULL,
    "domaine_id" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Metier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lycee" (
    "id" TEXT NOT NULL,
    "nom" VARCHAR(255) NOT NULL,
    "numero_uai" VARCHAR(20),
    "type_etablissement" VARCHAR(100),
    "statut_public_prive" VARCHAR(20),
    "adresse" TEXT NOT NULL,
    "code_postal" VARCHAR(10),
    "commune" VARCHAR(255),
    "departement" VARCHAR(255),
    "region_id" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "telephone" VARCHAR(20),
    "email" VARCHAR(255),
    "site_web" VARCHAR(500),
    "description" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lycee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Formation" (
    "id" TEXT NOT NULL,
    "lycee_id" TEXT NOT NULL,
    "intitule" VARCHAR(500) NOT NULL,
    "domaine_id" TEXT,
    "metier_id" TEXT,
    "niveau" VARCHAR(50),
    "modalite" VARCHAR(100),
    "duree_mois" INTEGER,
    "description" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Formation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlateauTechnique" (
    "id" TEXT NOT NULL,
    "lycee_id" TEXT NOT NULL,
    "nom" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "capacite_etudiants" INTEGER,
    "equipements" TEXT[],
    "image_url" VARCHAR(500),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlateauTechnique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entreprise" (
    "id" TEXT NOT NULL,
    "nom" VARCHAR(255) NOT NULL,
    "siret" VARCHAR(14),
    "siren" VARCHAR(9),
    "secteur_activite" VARCHAR(255),
    "code_naf" VARCHAR(10),
    "adresse" TEXT,
    "code_postal" VARCHAR(10),
    "commune" VARCHAR(255),
    "departement" VARCHAR(255),
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "telephone" VARCHAR(20),
    "email" VARCHAR(255),
    "site_web" VARCHAR(500),
    "effectif" VARCHAR(50),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Entreprise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" VARCHAR(50) NOT NULL DEFAULT 'USER',
    "full_name" VARCHAR(255),
    "lycee_id" TEXT,
    "entreprise_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Demande" (
    "id" TEXT NOT NULL,
    "entreprise_id" TEXT NOT NULL,
    "metier_id" TEXT,
    "titre" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type_partenariat" VARCHAR(100),
    "zone_geo" VARCHAR(255),
    "nb_places" INTEGER,
    "date_debut_souhaitee" DATE,
    "date_fin_souhaitee" DATE,
    "statut" VARCHAR(50) NOT NULL DEFAULT 'EN_ATTENTE',
    "priorite" VARCHAR(20) NOT NULL DEFAULT 'NORMALE',
    "date_creation" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Demande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemandeLycee" (
    "id" TEXT NOT NULL,
    "demande_id" TEXT NOT NULL,
    "lycee_id" TEXT NOT NULL,
    "note" TEXT,
    "statut_traitement" VARCHAR(50) NOT NULL DEFAULT 'NOUVEAU',
    "score_matching" DECIMAL(3,2),
    "distance_km" DECIMAL(6,2),
    "date_affectation" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_reponse" TIMESTAMP(6),
    "user_traitement_id" TEXT,

    CONSTRAINT "DemandeLycee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Action" (
    "id" TEXT NOT NULL,
    "demande_id" TEXT,
    "demande_lycee_id" TEXT,
    "user_id" TEXT NOT NULL,
    "type_action" VARCHAR(100) NOT NULL,
    "commentaire" TEXT,
    "donnees_avant" JSONB,
    "donnees_apres" JSONB,
    "date_action" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Region_nom_key" ON "Region"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Domaine_nom_key" ON "Domaine"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Lycee_numero_uai_key" ON "Lycee"("numero_uai");

-- CreateIndex
CREATE UNIQUE INDEX "Entreprise_siret_key" ON "Entreprise"("siret");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DemandeLycee_demande_id_lycee_id_key" ON "DemandeLycee"("demande_id", "lycee_id");

-- AddForeignKey
ALTER TABLE "Metier" ADD CONSTRAINT "Metier_domaine_id_fkey" FOREIGN KEY ("domaine_id") REFERENCES "Domaine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lycee" ADD CONSTRAINT "Lycee_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Formation" ADD CONSTRAINT "Formation_lycee_id_fkey" FOREIGN KEY ("lycee_id") REFERENCES "Lycee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Formation" ADD CONSTRAINT "Formation_domaine_id_fkey" FOREIGN KEY ("domaine_id") REFERENCES "Domaine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Formation" ADD CONSTRAINT "Formation_metier_id_fkey" FOREIGN KEY ("metier_id") REFERENCES "Metier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlateauTechnique" ADD CONSTRAINT "PlateauTechnique_lycee_id_fkey" FOREIGN KEY ("lycee_id") REFERENCES "Lycee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_lycee_id_fkey" FOREIGN KEY ("lycee_id") REFERENCES "Lycee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_entreprise_id_fkey" FOREIGN KEY ("entreprise_id") REFERENCES "Entreprise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demande" ADD CONSTRAINT "Demande_entreprise_id_fkey" FOREIGN KEY ("entreprise_id") REFERENCES "Entreprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demande" ADD CONSTRAINT "Demande_metier_id_fkey" FOREIGN KEY ("metier_id") REFERENCES "Metier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandeLycee" ADD CONSTRAINT "DemandeLycee_demande_id_fkey" FOREIGN KEY ("demande_id") REFERENCES "Demande"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandeLycee" ADD CONSTRAINT "DemandeLycee_lycee_id_fkey" FOREIGN KEY ("lycee_id") REFERENCES "Lycee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandeLycee" ADD CONSTRAINT "DemandeLycee_user_traitement_id_fkey" FOREIGN KEY ("user_traitement_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_demande_id_fkey" FOREIGN KEY ("demande_id") REFERENCES "Demande"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_demande_lycee_id_fkey" FOREIGN KEY ("demande_lycee_id") REFERENCES "DemandeLycee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

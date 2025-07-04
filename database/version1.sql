CREATE TABLE "User" (
  "id" uuid PRIMARY KEY,
  "email" varchar,
  "password_hash" varchar,
  "role" varchar,
  "full_name" varchar,
  "lycee_id" uuid,
  "created_at" datetime
);

CREATE TABLE "Lycee" (
  "id" uuid PRIMARY KEY,
  "nom" varchar,
  "adresse" varchar,
  "region_id" uuid,
  "description" text,
  "site_web" varchar,
  "created_at" datetime
);

CREATE TABLE "Formation" (
  "id" uuid PRIMARY KEY,
  "lycee_id" uuid,
  "intitule" varchar,
  "domaine_id" uuid,
  "metier_id" uuid,
  "modalite" varchar
);

CREATE TABLE "PlateauTechnique" (
  "id" uuid PRIMARY KEY,
  "lycee_id" uuid,
  "nom" varchar,
  "description" text,
  "image_url" varchar
);

CREATE TABLE "Entreprise" (
  "id" uuid PRIMARY KEY,
  "nom" varchar,
  "siret" varchar,
  "secteur" varchar,
  "adresse" varchar,
  "created_at" datetime
);

CREATE TABLE "Demande" (
  "id" uuid PRIMARY KEY,
  "entreprise_id" uuid,
  "metier_id" uuid,
  "zone_geo" varchar,
  "statut" varchar,
  "date_creation" datetime
);

CREATE TABLE "DemandeLycee" (
  "id" uuid PRIMARY KEY,
  "demande_id" uuid,
  "lycee_id" uuid,
  "note" text,
  "statut_traitement" varchar,
  "date_affectation" datetime
);

CREATE TABLE "Action" (
  "id" uuid PRIMARY KEY,
  "demande_id" uuid,
  "user_id" uuid,
  "type_action" varchar,
  "commentaire" text,
  "date_action" datetime
);

CREATE TABLE "Region" (
  "id" uuid PRIMARY KEY,
  "nom" varchar
);

CREATE TABLE "Domaine" (
  "id" uuid PRIMARY KEY,
  "nom" varchar
);

CREATE TABLE "Metier" (
  "id" uuid PRIMARY KEY,
  "nom" varchar,
  "domaine_id" uuid
);

COMMENT ON COLUMN "User"."lycee_id" IS 'Null si entreprise';

ALTER TABLE "User" ADD FOREIGN KEY ("lycee_id") REFERENCES "Lycee" ("id");

ALTER TABLE "Lycee" ADD FOREIGN KEY ("region_id") REFERENCES "Region" ("id");

ALTER TABLE "Formation" ADD FOREIGN KEY ("lycee_id") REFERENCES "Lycee" ("id");

ALTER TABLE "Formation" ADD FOREIGN KEY ("domaine_id") REFERENCES "Domaine" ("id");

ALTER TABLE "Formation" ADD FOREIGN KEY ("metier_id") REFERENCES "Metier" ("id");

ALTER TABLE "PlateauTechnique" ADD FOREIGN KEY ("lycee_id") REFERENCES "Lycee" ("id");

ALTER TABLE "Demande" ADD FOREIGN KEY ("entreprise_id") REFERENCES "Entreprise" ("id");

ALTER TABLE "Demande" ADD FOREIGN KEY ("metier_id") REFERENCES "Metier" ("id");

ALTER TABLE "DemandeLycee" ADD FOREIGN KEY ("demande_id") REFERENCES "Demande" ("id");

ALTER TABLE "DemandeLycee" ADD FOREIGN KEY ("lycee_id") REFERENCES "Lycee" ("id");

ALTER TABLE "Action" ADD FOREIGN KEY ("demande_id") REFERENCES "Demande" ("id");

ALTER TABLE "Action" ADD FOREIGN KEY ("user_id") REFERENCES "User" ("id");

ALTER TABLE "Metier" ADD FOREIGN KEY ("domaine_id") REFERENCES "Domaine" ("id");

"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface LyceeData {
  nom: string;
  codeUai: string;
  ville: string;
  codePostal: string;
  adresse: string;
  telephone: string;
  email: string;
  siteWeb: string;
  secteur: string;
  academie: string;
  description: string;
  stats: {
    eleves: number;
    apprentis: number;
    adultes: number;
    stages: number;
    entreprises: number;
    satisfaction: number;
  };
  formations: string[];
  installations: Array<{
    nom: string;
    surface: string;
    equipements: string;
  }>;
  actions: Array<{
    titre: string;
    description: string;
  }>;
  partenaires: string[];
}

const LyceePage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("metiers");
  const [lyceeData, setLyceeData] = useState<LyceeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApiWarning, setShowApiWarning] = useState(false);

  // Redirection si non connecté ou pas un lycée
  useEffect(() => {
    // Attendre que le chargement soit terminé avant de faire les vérifications
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/auth?type=lycee");
    } else if (isAuthenticated && user && user.type !== "lycee") {
      router.push("/");
    } else if (isAuthenticated && user && user.type === "lycee") {
      loadLyceeData();
    }
  }, [isAuthenticated, user, router, isLoading]);

  const loadLyceeData = async () => {
    try {
      setLoading(true);

      if (!user?.uai) {
        console.error("UAI manquant pour le lycée");
        // Utiliser des données par défaut si l'UAI est manquant
        setLyceeData(getDefaultLyceeData(user?.name || "Mon Lycée"));
        setShowApiWarning(true);
        return;
      }

      console.log("🔍 Chargement des données pour le lycée UAI:", user.uai);

      // Appel API réel avec l'UAI du lycée
      const response = await fetch(
        `http://localhost:3001/api/lycees/${user.uai}`
      );
      const data = await response.json();

      if (response.ok && data.success) {
        console.log("✅ Données lycée trouvées:", data.data);
        // Transformer les données de l'API vers notre format local
        const apiLycee = data.data;
        setLyceeData({
          nom: apiLycee.nom_etablissement || user?.name || "Lycée Henri Senez",
          codeUai: apiLycee.numero_uai || user.uai,
          ville: apiLycee.localite_acheminement_uai || "Hénin-Beaumont",
          codePostal: apiLycee.code_postal_uai || "62110",
          adresse: apiLycee.adresse_1 || "553 rue Fernand Darchicourt",
          telephone: apiLycee.telephone || "03 21 20 61 61",
          email: apiLycee.mail || "ce.0623456a@ac-lille.fr",
          siteWeb: apiLycee.site_web || "www.lyceesenez.fr",
          secteur: apiLycee.secteur_public_prive_libe || "Public",
          academie: apiLycee.libelle_academie || "Lille",
          description:
            "Lycée professionnel spécialisé dans les métiers de l\u0027industrie et des services.",
          stats: {
            eleves: 1200,
            apprentis: 400,
            adultes: 200,
            stages: 2400,
            entreprises: 400,
            satisfaction: 90,
          },
          formations:
            apiLycee.formations && apiLycee.formations.length > 0
              ? apiLycee.formations
              : [
                  "Hôtellerie Restauration: Cuisine, Service, Réception",
                  "Gestion Relation Client: Commerce, Vente, Accueil, Administration",
                  "Mécanique Automobile",
                  "Industrie Chaudronnerie: Chaudronniers Soudeurs",
                  "Métiers de la sécurité",
                ],
          installations: getDefaultInstallations(),
          actions: getDefaultActions(),
          partenaires: getDefaultPartenaires(),
        });
      } else {
        console.warn(
          "⚠️ Lycée non trouvé dans l'API, utilisation des données par défaut"
        );
        console.log("Réponse API:", { status: response.status, data });

        // Utiliser des données par défaut si le lycée n'est pas trouvé
        setLyceeData(getDefaultLyceeData(user?.name || `Lycée ${user.uai}`));
        setShowApiWarning(true);
      }
    } catch (error) {
      console.error("❌ Erreur lors du chargement des données lycée:", error);
      // En cas d'erreur réseau ou autre, utiliser des données par défaut
      setLyceeData(getDefaultLyceeData(user?.name || "Mon Lycée"));
      setShowApiWarning(true);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour générer des données par défaut
  const getDefaultLyceeData = (nom: string): LyceeData => ({
    nom,
    codeUai: user?.uai || "0000000X",
    ville: "Ville non renseignée",
    codePostal: "00000",
    adresse: "Adresse non renseignée",
    telephone: "Téléphone non renseigné",
    email: "Email non renseigné",
    siteWeb: "Site web non renseigné",
    secteur: "Public",
    academie: "Académie non renseignée",
    description:
      "Lycée professionnel en cours de configuration. Les informations détaillées seront bientôt disponibles.",
    stats: {
      eleves: 0,
      apprentis: 0,
      adultes: 0,
      stages: 0,
      entreprises: 0,
      satisfaction: 0,
    },
    formations: ["Formations en cours de mise à jour..."],
    installations: getDefaultInstallations(),
    actions: getDefaultActions(),
    partenaires: getDefaultPartenaires(),
  });

  const getDefaultInstallations = () => [
    {
      nom: "Ateliers techniques",
      surface: "Information en cours de mise à jour",
      equipements: "Équipements en cours d'inventaire",
    },
    {
      nom: "Salles de formation",
      surface: "Information en cours de mise à jour",
      equipements: "Matériel pédagogique moderne",
    },
  ];

  const getDefaultActions = () => [
    {
      titre: "Journées portes ouvertes",
      description: "Découverte de l'établissement et des formations",
    },
    {
      titre: "Forums des métiers",
      description: "Rencontres avec des professionnels",
    },
    {
      titre: "Stages en entreprise",
      description: "Immersion professionnelle des élèves",
    },
  ];

  const getDefaultPartenaires = () => ["Partenaires en cours de mise à jour"];

  // Afficher un loader pendant le chargement de l'authentification
  if (isLoading) {
    return (
      <div className="fr-container fr-py-6w">
        <div className="fr-text--center">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  // Redirection seulement si on est sûr que ce n'est pas un lycée
  if (!isAuthenticated || (user && user.type !== "lycee")) {
    return (
      <div className="fr-container fr-py-6w">
        <div className="fr-text--center">
          <p>Redirection en cours...</p>
        </div>
      </div>
    );
  }

  if (loading || !lyceeData) {
    return (
      <div className="fr-container fr-py-6w">
        <div className="fr-text--center">
          <p>Chargement des données du lycée...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "metiers", label: "Métiers", icon: "fr-icon-award-line" },
    {
      id: "installations",
      label: "Installations",
      icon: "fr-icon-building-line",
    },
    { id: "portraits", label: "Portraits", icon: "fr-icon-user-line" },
    { id: "actions", label: "Actions", icon: "fr-icon-calendar-event-line" },
    { id: "partenaires", label: "Partenaires", icon: "fr-icon-links-line" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "metiers":
        return (
          <div>
            <h3 className="fr-h3 fr-mb-4w">Les métiers</h3>
            <ul className="fr-list">
              {lyceeData.formations.map((formation, index) => (
                <li key={index}>{formation}</li>
              ))}
            </ul>

            <div className="fr-select-group fr-mt-4w">
              <label className="fr-label" htmlFor="select-metier">
                Choisir un métier
              </label>
              <select className="fr-select" id="select-metier">
                <option value="">Métiers du sport</option>
                <option value="coach">Coach sportif</option>
                <option value="professeur">Professeur d&apos;EPS</option>
                <option value="kine">Kinésithérapeute</option>
              </select>
            </div>
          </div>
        );

      case "installations":
        return (
          <div>
            <h3 className="fr-h3 fr-mb-4w">Nos installations</h3>
            <div className="fr-grid-row fr-grid-row--gutters">
              {lyceeData.installations.map((installation, index) => (
                <div key={index} className="fr-col-12 fr-col-md-6">
                  <div className="fr-card fr-card--sm fr-p-3w">
                    <h4 className="fr-h4">{installation.nom}</h4>
                    <p className="fr-text--sm fr-mb-1w">
                      <strong>Surface :</strong> {installation.surface}
                    </p>
                    <p className="fr-text--sm">
                      <strong>Équipements :</strong> {installation.equipements}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "portraits":
        return (
          <div>
            <h3 className="fr-h3 fr-mb-4w">Portraits d anciens élèves</h3>
            <div className="fr-grid-row fr-grid-row--gutters">
              <div className="fr-col-12 fr-col-md-6">
                <div className="fr-card fr-p-4w">
                  <div className="fr-grid-row fr-grid-row--middle">
                    <div className="fr-col-auto">
                      <div className="fr-avatar fr-avatar--md">
                        <span>M</span>
                      </div>
                    </div>
                    <div className="fr-col">
                      <h4 className="fr-h4 fr-mb-1w">Marie Dupont</h4>
                      <p className="fr-text--sm">
                        Technicienne maintenance - APERAM
                      </p>
                      <p className="fr-text--sm fr-mt-2w">
                        &quot;L&apos;alternance m&apos;a permis d&apos;acquérir
                        une expérience précieuse tout en étudiant.&quot;
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="fr-col-12 fr-col-md-6">
                <div className="fr-card fr-p-4w">
                  <div className="fr-grid-row fr-grid-row--middle">
                    <div className="fr-col-auto">
                      <div className="fr-avatar fr-avatar--md">
                        <span>T</span>
                      </div>
                    </div>
                    <div className="fr-col">
                      <h4 className="fr-h4 fr-mb-1w">Thomas Martin</h4>
                      <p className="fr-text--sm">Électrotechnicien - ENGIE</p>
                      <p className="fr-text--sm fr-mt-2w">
                        &quot;Les formateurs nous préparent vraiment bien au
                        monde professionnel.&quot;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "actions":
        return (
          <div>
            <h3 className="fr-h3 fr-mb-4w">Nos actions</h3>
            <div className="fr-grid-row fr-grid-row--gutters">
              {lyceeData.actions.map((action, index) => (
                <div key={index} className="fr-col-12 fr-col-md-6">
                  <div className="fr-card fr-card--sm fr-p-3w">
                    <h4 className="fr-h4">{action.titre}</h4>
                    <p className="fr-text--sm">{action.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "partenaires":
        return (
          <div>
            <h3 className="fr-h3 fr-mb-4w">Nos partenaires</h3>
            <div className="fr-grid-row fr-grid-row--gutters">
              {lyceeData.partenaires.map((partenaire, index) => (
                <div key={index} className="fr-col-6 fr-col-md-3">
                  <div className="fr-card fr-card--sm fr-p-2w fr-text--center">
                    <p className="fr-text--sm fr-mb-0">{partenaire}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fr-container fr-py-6w">
      {/* Alerte si données par défaut */}
      {showApiWarning && (
        <div className="fr-alert fr-alert--warning fr-mb-4w">
          <p className="fr-alert__title">
            <span
              className="fr-icon-information-line fr-mr-1w"
              aria-hidden="true"
            ></span>
            Informations provisoires
          </p>
          <p>
            Les données de votre lycée ne sont pas encore disponibles dans notre
            base. Des informations par défaut sont affichées. Vos données seront
            mises à jour prochainement.
          </p>
          <div className="fr-btns-group fr-btns-group--sm">
            <button
              className="fr-btn fr-btn--sm"
              onClick={() => {
                setShowApiWarning(false);
                loadLyceeData();
              }}
            >
              Réessayer
            </button>
            <button
              className="fr-btn fr-btn--sm fr-btn--tertiary"
              onClick={() => setShowApiWarning(false)}
            >
              Fermer cette alerte
            </button>
          </div>
        </div>
      )}

      {/* En-tête avec bouton retour et gestion profil */}
      <div className="fr-mb-4w">
        <div className="fr-grid-row fr-grid-row--middle fr-grid-row--gutters">
          <div className="fr-col">
            <h1 className="fr-h1 fr-mb-2w">Mon établissement</h1>
            <p className="fr-text--lead fr-mb-2w">
              Mon Lycée &gt; Carte d&apos;identité du lycée
            </p>
          </div>
          <div className="fr-col-auto">
            <button
              onClick={() => router.push("/lycee/profil")}
              className="fr-btn fr-btn--icon-left fr-icon-settings-5-line"
            >
              Gérer mon profil
            </button>
          </div>
        </div>
      </div>

      {/* Informations principales du lycée */}
      <div className="fr-card fr-p-4w fr-mb-4w">
        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12 fr-col-lg-8">
            <h2 className="fr-h2 fr-mb-2w">{lyceeData.nom}</h2>

            <div className="fr-mb-4w">
              <h3 className="fr-h6 fr-mb-1w">Adresse</h3>
              <p className="fr-text--sm fr-mb-1w">{lyceeData.adresse}</p>
              <p className="fr-text--sm">
                {lyceeData.codePostal} {lyceeData.ville}
              </p>
            </div>

            <div className="fr-mb-4w">
              <h3 className="fr-h6 fr-mb-1w">Site web</h3>
              <p className="fr-text--sm">{lyceeData.siteWeb}</p>
            </div>

            <div>
              <h3 className="fr-h6 fr-mb-1w">Chiffres clés (2023-2024)</h3>
              <div className="fr-grid-row fr-grid-row--gutters fr-text--sm">
                <div className="fr-col-6 fr-col-md-4">
                  <strong>{lyceeData.stats.eleves} élèves</strong>
                </div>
                <div className="fr-col-6 fr-col-md-4">
                  <strong>{lyceeData.stats.apprentis} apprentis</strong>
                </div>
                <div className="fr-col-6 fr-col-md-4">
                  <strong>
                    {lyceeData.stats.adultes} adultes formation continue
                  </strong>
                </div>
                <div className="fr-col-6 fr-col-md-4">
                  <strong>
                    {lyceeData.stats.entreprises} entreprises partenaires
                  </strong>
                </div>
                <div className="fr-col-6 fr-col-md-4">
                  <strong>
                    +{lyceeData.stats.stages} stages à l&apos;année
                  </strong>
                </div>
                <div className="fr-col-6 fr-col-md-4">
                  <strong>
                    {lyceeData.stats.satisfaction}% de satisfaction des
                    entreprises accueillantes
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <div className="fr-col-12 fr-col-lg-4">
            <div className="fr-card fr-card--grey fr-p-4w fr-text--center">
              <div className="fr-mb-2w">
                <span
                  className="fr-icon-hotel-line"
                  style={{ fontSize: "3rem" }}
                  aria-hidden="true"
                ></span>
              </div>
              <p className="fr-text--bold fr-mb-0">LOGO LYCÉE</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="fr-tabs">
        <ul
          className="fr-tabs__list"
          role="tablist"
          aria-label="Navigation dans les sections du lycée"
        >
          {tabs.map((tab) => (
            <li key={tab.id} role="presentation">
              <button
                className={`fr-tabs__tab ${tab.icon} ${
                  activeTab === tab.id ? "fr-tabs__tab--selected" : ""
                }`}
                role="tab"
                onClick={() => setActiveTab(tab.id)}
                tabIndex={activeTab === tab.id ? 0 : -1}
                aria-selected={activeTab === tab.id}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Contenu des onglets */}
        <div
          className="fr-tabs__panel fr-tabs__panel--selected fr-p-4w"
          role="tabpanel"
        >
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default LyceePage;

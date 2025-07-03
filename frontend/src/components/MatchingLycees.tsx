"use client";

import React, { useState } from "react";

interface MatchingCriteria {
  entreprise?: {
    secteurActivite?: string;
    siret?: string;
    localisation?: {
      commune?: string;
      departement?: string;
      codePostal?: string;
    };
  };
  preferences?: {
    distanceMax?: number;
    typeEtablissement?: string;
    nombreResultats?: number;
  };
}

interface LyceeResult {
  lycee: {
    nom_etablissement: string;
    libelle_commune: string;
    libelle_departement: string;
    statut_public_prive: string;
    formations?: string[];
    telephone?: string;
    mail?: string;
    web?: string;
  };
  distance?: number;
}

interface EntrepriseInfo {
  denominationSociale: string;
  siret: string;
  secteurActivite: string;
  adresse: {
    commune: string;
    departement: string;
    codePostal: string;
  };
}

const MatchingLycees: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<LyceeResult[] | null>(null);
  const [entrepriseInfo, setEntrepriseInfo] = useState<EntrepriseInfo | null>(null);

  const [criteria, setCriteria] = useState<MatchingCriteria>({
    entreprise: {
      secteurActivite: "",
      siret: "",
      localisation: {
        commune: "",
        departement: "",
        codePostal: "",
      },
    },
    preferences: {
      distanceMax: 50,
      typeEtablissement: "tous",
      nombreResultats: 10,
    },
  });

  const handleSearch = async () => {
    if (!criteria.entreprise?.secteurActivite && !criteria.entreprise?.siret) {
      setError(
        "Veuillez renseigner au minimum un secteur d'activité ou un SIRET"
      );
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setEntrepriseInfo(null);

    try {
      console.log("Recherche avec critères:", criteria);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/api/matching`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(criteria),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log("✅ Résultats reçus:", data.data);
        console.log("✅ Nombre de lycées:", data.data.matches?.length || 0);

        setResults(data.data.matches || []);
        setEntrepriseInfo(data.data.entreprise || null);
        setError(null);
      } else {
        throw new Error(data.message || "Erreur lors de la recherche");
      }
    } catch (err) {
      console.error("❌ Erreur:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fr-py-6w" style={{ margin: 0, padding: 0 }}>
      {/* Hero Section DSFR */}
      <div className="fr-container-fluid fr-px-4w fr-mb-6w">
        <div className="fr-highlight fr-mb-4w">
          <p className="fr-highlight__title">Trouvez vos futurs alternants</p>
        </div>
        <h1 className="fr-h1 fr-mb-2w">
          Découvrez les lycées professionnels qui correspondent à votre secteur
          d&apos;activité
        </h1>
        <p className="fr-text--lead fr-mb-6w">
          Utilisez notre moteur de recherche pour identifier les établissements
          qui forment aux métiers de votre secteur d&apos;activité.
        </p>
      </div>

      {/* Formulaire de recherche DSFR */}
      <div className="fr-container-fluid fr-px-4w">
        <div className="fr-card fr-card--no-arrow fr-mb-6w">
          <div className="fr-card__body">
            <div className="fr-card__content">
              <h2 className="fr-card__title fr-mb-2w">
                <span
                  className="fr-icon-search-line fr-mr-1w"
                  aria-hidden="true"
                ></span>
                Critères de recherche
              </h2>
              <p className="fr-card__desc fr-mb-4w">
                Personnalisez votre recherche selon vos besoins et votre
                localisation
              </p>
            </div>
          </div>

          {/* Contenu du formulaire */}
          <div className="fr-card__body">
            <div className="fr-grid-row fr-grid-row--gutters">
              {/* Section Entreprise */}
              <div className="fr-col-12 fr-col-lg-6">
                <fieldset className="fr-fieldset">
                  <legend className="fr-fieldset__legend fr-text--regular">
                    <span
                      className="fr-icon-building-line fr-mr-1w"
                      aria-hidden="true"
                    ></span>
                    Votre entreprise
                  </legend>

                  {/* SIRET Input */}
                  <div className="fr-input-group fr-mb-4w">
                    <label className="fr-label" htmlFor="siret-input">
                      SIRET (optionnel)
                      <span className="fr-hint-text">
                        Saisissez le SIRET de votre entreprise pour récupérer
                        automatiquement ses informations
                      </span>
                    </label>
                    <input
                      className="fr-input"
                      type="text"
                      id="siret-input"
                      name="siret"
                      value={criteria.entreprise?.siret || ""}
                      onChange={(e) =>
                        setCriteria((prev) => ({
                          ...prev,
                          entreprise: {
                            ...prev.entreprise,
                            siret: e.target.value,
                          },
                        }))
                      }
                      placeholder="12345678901234"
                    />
                  </div>

                  {/* Secteur d'activité */}
                  <div className="fr-select-group fr-mb-4w">
                    <label className="fr-label" htmlFor="secteur-select">
                      Secteur d&apos;activité
                      <span className="fr-hint-text">* Champ obligatoire</span>
                    </label>
                    <select
                      className="fr-select"
                      id="secteur-select"
                      name="secteur"
                      value={criteria.entreprise?.secteurActivite || ""}
                      onChange={(e) =>
                        setCriteria((prev) => ({
                          ...prev,
                          entreprise: {
                            ...prev.entreprise,
                            secteurActivite: e.target.value,
                          },
                        }))
                      }
                      required
                    >
                      <option value="">Sélectionnez un secteur</option>
                      <option value="informatique">
                        Informatique et numérique
                      </option>
                      <option value="commerce">Commerce et vente</option>
                      <option value="industrie">Industrie et production</option>
                      <option value="batiment">
                        Bâtiment et travaux publics
                      </option>
                      <option value="restauration">
                        Restauration et hôtellerie
                      </option>
                      <option value="transport">Transport et logistique</option>
                      <option value="sante">Santé et social</option>
                    </select>
                  </div>
                </fieldset>
              </div>

              {/* Section Localisation et Préférences */}
              <div className="fr-col-12 fr-col-lg-6">
                <fieldset className="fr-fieldset">
                  <legend className="fr-fieldset__legend fr-text--regular">
                    <span
                      className="fr-icon-map-pin-2-line fr-mr-1w"
                      aria-hidden="true"
                    ></span>
                    Localisation et Préférences
                  </legend>

                  {/* Commune */}
                  <div className="fr-input-group fr-mb-4w">
                    <label className="fr-label" htmlFor="commune-input">
                      Commune
                      <span className="fr-hint-text">
                        Ville où rechercher des lycées
                      </span>
                    </label>
                    <input
                      className="fr-input"
                      type="text"
                      id="commune-input"
                      name="commune"
                      value={criteria.entreprise?.localisation?.commune || ""}
                      onChange={(e) =>
                        setCriteria((prev) => ({
                          ...prev,
                          entreprise: {
                            ...prev.entreprise,
                            localisation: {
                              ...prev.entreprise?.localisation,
                              commune: e.target.value,
                            },
                          },
                        }))
                      }
                      placeholder="Paris, Lyon, Marseille..."
                    />
                  </div>

                  <div className="fr-grid-row fr-grid-row--gutters fr-mb-4w">
                    <div className="fr-col-6">
                      <div className="fr-input-group">
                        <label className="fr-label" htmlFor="distance-input">
                          Distance maximale (km)
                        </label>
                        <input
                          className="fr-input"
                          type="number"
                          id="distance-input"
                          name="distance"
                          min="1"
                          max="200"
                          value={criteria.preferences?.distanceMax || 50}
                          onChange={(e) =>
                            setCriteria((prev) => ({
                              ...prev,
                              preferences: {
                                ...prev.preferences,
                                distanceMax: parseInt(e.target.value) || 50,
                              },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="fr-col-6">
                      <div className="fr-select-group">
                        <label
                          className="fr-label"
                          htmlFor="nombre-resultats-select"
                        >
                          Nombre de lycées souhaités
                        </label>
                        <select
                          className="fr-select"
                          id="nombre-resultats-select"
                          name="nombreResultats"
                          value={criteria.preferences?.nombreResultats || 10}
                          onChange={(e) =>
                            setCriteria((prev) => ({
                              ...prev,
                              preferences: {
                                ...prev.preferences,
                                nombreResultats: parseInt(e.target.value),
                              },
                            }))
                          }
                        >
                          <option value={5}>5 lycées</option>
                          <option value={10}>10 lycées</option>
                          <option value={15}>15 lycées</option>
                          <option value={20}>20 lycées</option>
                          <option value={30}>30 lycées</option>
                          <option value={50}>50 lycées</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Type d'établissement */}
                  <div className="fr-form-group">
                    <fieldset className="fr-fieldset">
                      <legend className="fr-fieldset__legend fr-text--regular">
                        Type d&apos;établissement
                      </legend>
                      <div className="fr-fieldset__content">
                        <div className="fr-radio-group fr-radio-rich">
                          <input
                            type="radio"
                            id="type-tous"
                            name="typeEtablissement"
                            value="tous"
                            checked={
                              criteria.preferences?.typeEtablissement === "tous"
                            }
                            onChange={(e) =>
                              setCriteria((prev) => ({
                                ...prev,
                                preferences: {
                                  ...prev.preferences,
                                  typeEtablissement: e.target.value,
                                },
                              }))
                            }
                          />
                          <label className="fr-label" htmlFor="type-tous">
                            Tous les établissements
                          </label>
                        </div>
                        <div className="fr-radio-group fr-radio-rich">
                          <input
                            type="radio"
                            id="type-public"
                            name="typeEtablissement"
                            value="public"
                            checked={
                              criteria.preferences?.typeEtablissement ===
                              "public"
                            }
                            onChange={(e) =>
                              setCriteria((prev) => ({
                                ...prev,
                                preferences: {
                                  ...prev.preferences,
                                  typeEtablissement: e.target.value,
                                },
                              }))
                            }
                          />
                          <label className="fr-label" htmlFor="type-public">
                            Public uniquement
                          </label>
                        </div>
                        <div className="fr-radio-group fr-radio-rich">
                          <input
                            type="radio"
                            id="type-prive"
                            name="typeEtablissement"
                            value="prive"
                            checked={
                              criteria.preferences?.typeEtablissement ===
                              "prive"
                            }
                            onChange={(e) =>
                              setCriteria((prev) => ({
                                ...prev,
                                preferences: {
                                  ...prev.preferences,
                                  typeEtablissement: e.target.value,
                                },
                              }))
                            }
                          />
                          <label className="fr-label" htmlFor="type-prive">
                            Privé uniquement
                          </label>
                        </div>
                      </div>
                    </fieldset>
                  </div>
                </fieldset>
              </div>
            </div>

            {/* Bouton de recherche */}
            <div className="fr-mt-6w fr-mb-4w">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="fr-btn fr-btn--lg fr-btn--icon-left fr-icon-search-line"
              >
                {loading ? "Recherche en cours..." : "Rechercher des lycées"}
              </button>
            </div>

            {/* Affichage des erreurs */}
            {error && (
              <div className="fr-alert fr-alert--error fr-mt-4w">
                <h3 className="fr-alert__title">Erreur lors de la recherche</h3>
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Affichage des informations d'entreprise si trouvée via SIRET */}
      {entrepriseInfo && (
        <div className="fr-container-fluid fr-px-4w fr-mt-6w">
          <div className="fr-card fr-card--no-arrow">
            <div className="fr-card__body">
              <div className="fr-card__content">
                <h3 className="fr-card__title">
                  <span
                    className="fr-icon-building-line fr-mr-1w"
                    aria-hidden="true"
                  ></span>
                  Informations de votre entreprise
                </h3>
                <p className="fr-card__desc">
                  Données récupérées depuis la base SIRENE
                </p>

                <div className="fr-grid-row fr-grid-row--gutters fr-mt-4w">
                  <div className="fr-col-12 fr-col-md-6">
                    <h4 className="fr-h6">
                      {entrepriseInfo.denominationSociale}
                    </h4>
                    <ul className="fr-list">
                      <li>
                        <span
                          className="fr-icon-building-line fr-mr-1w"
                          aria-hidden="true"
                        ></span>
                        SIRET: {entrepriseInfo.siret}
                      </li>
                      <li>
                        <span
                          className="fr-icon-briefcase-line fr-mr-1w"
                          aria-hidden="true"
                        ></span>
                        Secteur: {entrepriseInfo.secteurActivite}
                      </li>
                    </ul>
                  </div>
                  <div className="fr-col-12 fr-col-md-6">
                    <h5 className="fr-h6">Adresse</h5>
                    <ul className="fr-list">
                      <li>
                        <span
                          className="fr-icon-map-pin-2-line fr-mr-1w"
                          aria-hidden="true"
                        ></span>
                        {entrepriseInfo.adresse.commune} (
                        {entrepriseInfo.adresse.departement})
                      </li>
                      <li>
                        <span
                          className="fr-icon-mail-line fr-mr-1w"
                          aria-hidden="true"
                        ></span>
                        {entrepriseInfo.adresse.codePostal}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Affichage des résultats sur carte */}
      {results && results.length > 0 && (
        <div className="fr-container fr-mt-6w">
          <div className="fr-alert fr-alert--success fr-mb-4w">
            <h3 className="fr-alert__title">Résultats de recherche</h3>
            <p>
              {results.length} lycée(s) trouvé(s) correspondant à vos critères - Affichage sur carte interactive
            </p>
          </div>

          {/* Carte interactive des lycées professionnels */}
          <div className="fr-card fr-card--no-arrow">
            <div className="fr-card__body">
              <div className="fr-card__content">
                <h4 className="fr-card__title">
                  <span className="fr-icon-map-pin-2-line fr-mr-2w" aria-hidden="true"></span>
                  Localisation des lycées professionnels
                </h4>
                <p className="fr-card__desc fr-mb-4w">
                  Carte interactive des lycées professionnels français - Données officielles du Ministère de l&apos;Éducation nationale
                </p>
                
                <div style={{ position: 'relative', height: '600px', width: '100%', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                  <iframe
                    src="https://data.education.gouv.fr/explore/embed/dataset/fr-en-annuaire_bde_lycees_pro/carte/?disjunctive.code_postal_uai&disjunctive.localite_acheminement_uai&disjunctive.libelle_commune&disjunctive.libelle_departement&disjunctive.libelle_region&disjunctive.libelle_academie&sort=numero_uai"
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                    title="Carte des lycées professionnels français"
                    allowFullScreen
                  />
                </div>
                
                <div className="fr-mt-4w">
                  <div className="fr-grid-row fr-grid-row--gutters">
                    <div className="fr-col-12 fr-col-md-6">
                      <div className="fr-callout fr-callout--blue-france">
                        <h5 className="fr-callout__title">
                          <span className="fr-icon-information-line fr-mr-1w" aria-hidden="true"></span>
                          Fonctionnalités de la carte
                        </h5>
                        <ul className="fr-list">
                          <li>Zoom et navigation libre</li>
                          <li>Filtres par région, département, commune</li>
                          <li>Informations détaillées par établissement</li>
                          <li>Recherche par nom d&apos;établissement</li>
                        </ul>
                      </div>
                    </div>
                    <div className="fr-col-12 fr-col-md-6">
                      <div className="fr-callout fr-callout--green-tilleul-verveine">
                        <h5 className="fr-callout__title">
                          <span className="fr-icon-award-line fr-mr-1w" aria-hidden="true"></span>
                          Données officielles
                        </h5>
                        <p className="fr-text--sm">
                          Cette carte utilise les données officielles de l&apos;annuaire 
                          des lycées professionnels du Ministère de l&apos;Éducation nationale, 
                          mise à jour régulièrement.
                        </p>
                        <a 
                          href="https://data.education.gouv.fr/explore/dataset/fr-en-annuaire_bde_lycees_pro/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="fr-link fr-link--icon-right fr-icon-external-link-line"
                        >
                          Accéder à la source des données
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message si aucun résultat */}
      {results && results.length === 0 && (
        <div className="fr-container fr-mt-6w">
          <div className="fr-alert fr-alert--info">
            <h3 className="fr-alert__title">Aucun lycée trouvé</h3>
            <p>
              Aucun établissement ne correspond à vos critères de recherche.
              Consultez la carte ci-dessous pour explorer tous les lycées professionnels disponibles.
            </p>
          </div>
          
          {/* Carte même sans résultats spécifiques */}
          <div className="fr-card fr-card--no-arrow fr-mt-4w">
            <div className="fr-card__body">
              <div className="fr-card__content">
                <h4 className="fr-card__title">
                  <span className="fr-icon-map-pin-2-line fr-mr-2w" aria-hidden="true"></span>
                  Explorer tous les lycées professionnels
                </h4>
                <p className="fr-card__desc fr-mb-4w">
                  Utilisez la carte interactive pour découvrir l&apos;ensemble des lycées professionnels français
                </p>
                
                <div style={{ position: 'relative', height: '600px', width: '100%', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                  <iframe
                    src="https://data.education.gouv.fr/explore/embed/dataset/fr-en-annuaire_bde_lycees_pro/carte/?disjunctive.code_postal_uai&disjunctive.localite_acheminement_uai&disjunctive.libelle_commune&disjunctive.libelle_departement&disjunctive.libelle_region&disjunctive.libelle_academie&sort=numero_uai"
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                    title="Carte des lycées professionnels français"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchingLycees;

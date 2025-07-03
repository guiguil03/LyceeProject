"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();

  const handleCreateDemande = () => {
    router.push("/demandes");
  };

  const handleSearch = () => {
    router.push("/search");
  };

  const handleDashboard = () => {
    router.push("/dashboard");
  };

  // Actions rapides pour utilisateurs connectés
  const getQuickActions = () => {
    if (!isAuthenticated || !user) return [];

    if (user.type === "entreprise") {
      return [
        {
          id: "dashboard",
          title: "Tableau de bord",
          description:
            "Accédez à votre espace personnel et consultez vos statistiques",
          icon: "fr-icon-dashboard-line",
          color: "primary",
          action: handleDashboard,
        },
        {
          id: "create",
          title: "Nouvelle demande",
          description:
            "Créer une demande de partenariat avec un lycée professionnel",
          icon: "fr-icon-add-line",
          color: "success",
          action: handleCreateDemande,
        },
        {
          id: "search",
          title: "Rechercher lycées",
          description:
            "Explorez notre base de données de lycées professionnels",
          icon: "fr-icon-search-line",
          color: "info",
          action: handleSearch,
        },
        {
          id: "profils",
          title: "Profils lycées",
          description: "Consultez les profils détaillés des établissements",
          icon: "fr-icon-building-line",
          color: "secondary",
          action: () => router.push("/lycees/profils"),
        },
      ];
    } else {
      return [
        {
          id: "dashboard",
          title: "Tableau de bord",
          description: "Accédez à votre espace lycée et gérez vos informations",
          icon: "fr-icon-dashboard-line",
          color: "primary",
          action: () => router.push("/lycee/dashboard"),
        },
        {
          id: "lycee",
          title: "Mon établissement",
          description: "Gérez les informations de votre lycée professionnel",
          icon: "fr-icon-school-line",
          color: "info",
          action: () => router.push("/lycee"),
        },
        {
          id: "profil",
          title: "Gérer mon profil",
          description:
            "Modifiez les détails et spécialités de votre établissement",
          icon: "fr-icon-settings-5-line",
          color: "secondary",
          action: () => router.push("/lycee/profil"),
        },
        {
          id: "demandes",
          title: "Demandes reçues",
          description: "Consultez et gérez les demandes d&apos;entreprises",
          icon: "fr-icon-mail-line",
          color: "warning",
          action: () => router.push("/demandes"),
        },
      ];
    }
  };

  const quickActions = getQuickActions();

  return (
    <div className="fr-container-fluid">
      {/* Hero Section */}
      <section className="fr-py-6w fr-py-md-12w">
        <div className="fr-container">
          <div className="fr-grid-row fr-grid-row--center">
            <div className="fr-col-12 fr-col-md-10 fr-col-lg-8">
              <div className="fr-mb-4w">
                <p className="fr-badge fr-badge--blue-ecume fr-badge--lg">
                  <span
                    className="fr-icon-award-line fr-mr-1w"
                    aria-hidden="true"
                  ></span>
                  Plateforme de partenariat éducatif
                </p>
              </div>

              <h1 className="fr-h1 fr-mb-4w">
                Connectons entreprises et lycées professionnels
              </h1>

              <p className="fr-text--lead fr-mb-6w">
                Une plateforme dédiée aux partenariats entre le monde
                professionnel et l&apos;enseignement technique. Créez des
                collaborations durables pour l&apos;insertion professionnelle
                des jeunes.
              </p>

              {!isAuthenticated ? (
                // Section choix de profil pour non-connectés
                <div className="fr-mb-6w">
                  <h3 className="fr-h3 fr-mb-4w">Vous êtes :</h3>
                  <div className="fr-grid-row fr-grid-row--gutters">
                    <div className="fr-col-12 fr-col-md-6">
                      <div
                        className="fr-card fr-card--horizontal fr-card--shadow"
                        style={{
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-4px)";
                          e.currentTarget.style.boxShadow =
                            "0 8px 20px rgba(0,0,0,0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "";
                        }}
                      >
                        <div className="fr-card__body">
                          <div className="fr-card__content">
                            <h4 className="fr-card__title">
                              <span
                                className="fr-icon-building-line fr-mr-2w"
                                aria-hidden="true"
                                style={{ fontSize: "1.5rem", color: "#000091" }}
                              ></span>
                              Une entreprise
                            </h4>
                            <p className="fr-card__desc">
                              Je souhaite créer des partenariats avec des lycées
                              professionnels pour des stages, alternances ou
                              projets collaboratifs.
                            </p>
                            <div className="fr-card__footer">
                              <button
                                className="fr-btn fr-btn--lg"
                                onClick={() =>
                                  router.push("/auth?type=entreprise")
                                }
                                title="Accéder à l'espace entreprise - Créez des partenariats avec les lycées"
                              >
                                Espace entreprise
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="fr-col-12 fr-col-md-6">
                      <div
                        className="fr-card fr-card--horizontal fr-card--shadow"
                        style={{
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-4px)";
                          e.currentTarget.style.boxShadow =
                            "0 8px 20px rgba(0,0,0,0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "";
                        }}
                      >
                        <div className="fr-card__body">
                          <div className="fr-card__content">
                            <h4 className="fr-card__title">
                              <span
                                className="fr-icon-book-2-line fr-mr-2w"
                                aria-hidden="true"
                                style={{ fontSize: "1.5rem", color: "#000091" }}
                              ></span>
                              Un lycée professionnel
                            </h4>
                            <p className="fr-card__desc">
                              Je représente un établissement et je souhaite
                              développer des partenariats avec les entreprises
                              locales et nationales.
                            </p>
                            <div className="fr-card__footer">
                              <button
                                className="fr-btn fr-btn--lg"
                                onClick={() => router.push("/auth?type=lycee")}
                                title="Accéder à l'espace lycée - Développez vos partenariats entreprises"
                              >
                                Espace lycée
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Section actions pour utilisateurs connectés
                <div className="fr-mb-6w">
                  <div className="fr-callout fr-callout--success">
                    <h3 className="fr-callout__title">
                      <span
                        className="fr-icon-user-line fr-mr-2w"
                        aria-hidden="true"
                      ></span>
                      Connecté en tant que{" "}
                      {user?.type === "entreprise" ? "Entreprise" : "Lycée"}
                    </h3>
                    <p className="fr-callout__text">
                      Bienvenue <strong>{user?.name}</strong> ! Accédez
                      rapidement à vos fonctionnalités principales.
                    </p>
                  </div>

                  {/* Actions rapides avec descriptions */}
                  <div className="fr-mt-6w">
                    <h4 className="fr-h4 fr-mb-4w">
                      <span
                        className="fr-icon-lightning-line fr-mr-2w"
                        aria-hidden="true"
                      ></span>
                      Actions rapides
                    </h4>

                    <div className="fr-grid-row fr-grid-row--gutters">
                      {quickActions.map((action) => (
                        <div key={action.id} className="fr-col-12">
                          <div
                            className="fr-card fr-card--horizontal fr-card--shadow"
                            style={{
                              transition: "all 0.3s ease",
                              cursor: "pointer",
                              marginBottom: "1rem",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform =
                                "translateY(-2px)";
                              e.currentTarget.style.boxShadow =
                                "0 6px 16px rgba(0,0,0,0.12)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "";
                            }}
                            onClick={action.action}
                          >
                            <div className="fr-card__body">
                              <div className="fr-card__content">
                                <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--middle">
                                  <div className="fr-col-auto">
                                    <div
                                      style={{
                                        width: "80px",
                                        height: "80px",
                                        borderRadius: "12px",
                                        backgroundColor:
                                          action.color === "primary"
                                            ? "#f0f0ff"
                                            : action.color === "success"
                                            ? "#f0fff4"
                                            : action.color === "info"
                                            ? "#f0f8ff"
                                            : action.color === "warning"
                                            ? "#fff8f0"
                                            : "#f5f5f5",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <span
                                        className={action.icon}
                                        aria-hidden="true"
                                        style={{
                                          fontSize: "2rem",
                                          color:
                                            action.color === "primary"
                                              ? "#000091"
                                              : action.color === "success"
                                              ? "#18753c"
                                              : action.color === "info"
                                              ? "#0063cb"
                                              : action.color === "warning"
                                              ? "#b34000"
                                              : "#666",
                                        }}
                                      ></span>
                                    </div>
                                  </div>
                                  <div className="fr-col">
                                    <h5 className="fr-card__title fr-mb-1w">
                                      {action.title}
                                    </h5>
                                    <p className="fr-card__desc fr-mb-0">
                                      {action.description}
                                    </p>
                                  </div>
                                  <div className="fr-col-auto">
                                    <span
                                      className={`fr-btn ${
                                        action.color === "primary"
                                          ? ""
                                          : action.color === "success"
                                          ? "fr-btn--success"
                                          : action.color === "info"
                                          ? "fr-btn--tertiary"
                                          : "fr-btn--secondary"
                                      } fr-btn--icon-right fr-icon-arrow-right-line`}
                                      style={{ pointerEvents: "none" }}
                                    >
                                      Accéder
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bouton de déconnexion */}
                  <div className="fr-mt-6w fr-text--center">
                    <button
                      onClick={logout}
                      className="fr-btn fr-btn--tertiary fr-btn--icon-left fr-icon-logout-box-r-line"
                      title="Se déconnecter de votre session"
                    >
                      Se déconnecter
                    </button>
                  </div>
                </div>
              )}

              <div className=" fr-btns-group--center fr-mt-6w">
                <a
                  href="#fonctionnalites"
                  className="fr-btn fr-btn--tertiary fr-btn--lg fr-btn--icon-left fr-icon-information-line"
                  title="Découvrir toutes les fonctionnalités de la plateforme"
                >
                  Découvrir la plateforme
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="fr-py-6w" id="fonctionnalites">
        <div className="fr-container">
          <div className="fr-grid-row fr-grid-row--center fr-mb-6w">
            <div className="fr-col-12 fr-col-lg-8">
              <h2 className="fr-h2 fr-mb-4w fr-text--center">
                Une plateforme complète pour tous
              </h2>
              <p className="fr-text--lead fr-text--center">
                Que vous représentiez une entreprise ou un lycée professionnel,
                notre plateforme facilite la création de partenariats durables.
              </p>
            </div>
          </div>

          {/* Fonctionnalités techniques */}
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-12 fr-col-md-4">
              <div
                className="fr-card fr-card--no-arrow fr-card--shadow"
                style={{ height: "100%" }}
              >
                <div className="fr-card__body">
                  <div className="fr-card__content fr-text--center">
                    <div className="fr-mb-3w">
                      <span
                        className="fr-icon-search-line"
                        aria-hidden="true"
                        style={{ fontSize: "3rem", color: "#000091" }}
                      ></span>
                    </div>
                    <h4 className="fr-card__title">Matching intelligent</h4>
                    <p className="fr-card__desc">
                      <strong>Algorithme de correspondance automatique</strong>{" "}
                      entre les besoins des entreprises et les spécialités des
                      lycées professionnels.
                    </p>
                    <div className="fr-mt-3w">
                      <span className="fr-badge fr-badge--blue-ecume">
                        Algorithme de correspondance
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="fr-col-12 fr-col-md-4">
              <div
                className="fr-card fr-card--no-arrow fr-card--shadow"
                style={{ height: "100%" }}
              >
                <div className="fr-card__body">
                  <div className="fr-card__content fr-text--center">
                    <div className="fr-mb-3w">
                      <span
                        className="fr-icon-map-pin-2-line"
                        aria-hidden="true"
                        style={{ fontSize: "3rem", color: "#18753c" }}
                      ></span>
                    </div>
                    <h4 className="fr-card__title">Géolocalisation avancée</h4>
                    <p className="fr-card__desc">
                      <strong>Trouvez les partenaires les plus proches</strong>{" "}
                      géographiquement pour faciliter les échanges et réduire
                      les déplacements.
                    </p>
                    <div className="fr-mt-3w">
                      <span className="fr-badge fr-badge--green-emeraude">
                        Recherche géographique
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="fr-col-12 fr-col-md-4">
              <div
                className="fr-card fr-card--no-arrow fr-card--shadow"
                style={{ height: "100%" }}
              >
                <div className="fr-card__body">
                  <div className="fr-card__content fr-text--center">
                    <div className="fr-mb-3w">
                      <span
                        className="fr-icon-file-text-line"
                        aria-hidden="true"
                        style={{ fontSize: "3rem", color: "#b34000" }}
                      ></span>
                    </div>
                    <h4 className="fr-card__title">Suivi des partenariats</h4>
                    <p className="fr-card__desc">
                      <strong>Dashboard complet</strong> pour suivre
                      l&apos;évolution de vos demandes et collaborations en
                      cours avec des statistiques détaillées.
                    </p>
                    <div className="fr-mt-3w">
                      <span className="fr-badge fr-badge--orange-terre-battue">
                        Analytics en temps réel
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="fr-py-6w fr-background-contrast--grey">
        <div className="fr-container">
          <div className="fr-grid-row fr-grid-row--center">
            <div className="fr-col-12 fr-col-lg-10">
              <h3 className="fr-h3 fr-mb-4w fr-text--center">
                Une plateforme au service de l&apos;insertion professionnelle
              </h3>

              <div className="fr-grid-row fr-grid-row--gutters">
                <div className="fr-col-12 fr-col-md-6">
                  <p className="fr-text--lg fr-mb-4w">
                    Notre plateforme connecte le monde de l&apos;entreprise et
                    l&apos;enseignement professionnel pour créer des
                    opportunités d&apos;insertion réussies pour les jeunes.
                  </p>
                  <p>
                    Basée sur les données officielles du ministère de
                    l&apos;Éducation nationale, elle facilite la mise en
                    relation et le suivi des partenariats éducatifs.
                  </p>
                </div>

                <div className="fr-col-12 fr-col-md-6">
                  <div className="fr-callout">
                    <h4 className="fr-callout__title">
                      <span
                        className="fr-icon-check-line fr-mr-1w"
                        aria-hidden="true"
                      ></span>
                      Fonctionnalités clés
                    </h4>
                    <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                      <li className="fr-mb-1w">
                        <span
                          className="fr-icon-arrow-right-line fr-mr-1w"
                          aria-hidden="true"
                        ></span>
                        Mise en relation entreprises/lycées
                      </li>
                      <li className="fr-mb-1w">
                        <span
                          className="fr-icon-arrow-right-line fr-mr-1w"
                          aria-hidden="true"
                        ></span>
                        Gestion des demandes de partenariat
                      </li>
                      <li className="fr-mb-1w">
                        <span
                          className="fr-icon-arrow-right-line fr-mr-1w"
                          aria-hidden="true"
                        ></span>
                        Matching automatique par secteur
                      </li>
                      <li className="fr-mb-1w">
                        <span
                          className="fr-icon-arrow-right-line fr-mr-1w"
                          aria-hidden="true"
                        ></span>
                        Tableau de bord de suivi
                      </li>
                      <li className="fr-mb-1w">
                        <span
                          className="fr-icon-arrow-right-line fr-mr-1w"
                          aria-hidden="true"
                        ></span>
                        Recherche géographique avancée
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function DemandesLyceePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirection si non connecté ou pas un lycée
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/auth?type=lycee");
    } else if (isAuthenticated && user && user.type !== "lycee") {
      router.push("/");
    }
  }, [isAuthenticated, user, router, isLoading]);

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

  return (
    <div className="fr-container fr-py-6w">
      {/* En-tête avec navigation */}
      <div className="fr-mb-6w">
        {/* Breadcrumb */}
        <nav className="fr-breadcrumb fr-mb-4w" aria-label="vous êtes ici :">
          <button
            onClick={() => router.push("/lycee")}
            className="fr-breadcrumb__button"
            aria-current="false"
          >
            Mon Lycée
          </button>
          <ol className="fr-breadcrumb__list">
            <li>
              <a className="fr-breadcrumb__link" href="#" aria-current="page">
                Demandes reçues
              </a>
            </li>
          </ol>
        </nav>

        {/* Titre et description */}
        <div className="fr-grid-row fr-grid-row--middle fr-grid-row--gutters">
          <div className="fr-col">
            <div className="fr-mb-2w">
              <p className="fr-badge fr-badge--orange-terre-battue fr-badge--sm">
                <span
                  className="fr-icon-mail-line fr-mr-1w"
                  aria-hidden="true"
                ></span>
                Demandes d&apos;entreprises
              </p>
            </div>
            <h1 className="fr-h1 fr-mb-2w">
              <span
                className="fr-icon-mail-line fr-mr-2w"
                aria-hidden="true"
              ></span>
              Demandes reçues
            </h1>
            <p className="fr-text--lead fr-text--grey fr-mb-0">
              Consultez et gérez les demandes de partenariat des entreprises
            </p>
          </div>
        </div>
      </div>

      {/* Contenu des demandes */}
      <div className="fr-mb-6w">
        <h3 className="fr-h3 fr-mb-4w">Demandes d&apos;entreprises</h3>

        <div className="fr-alert fr-alert--info fr-mb-4w">
          <p>
            Vous avez <strong>3 nouvelles demandes</strong> d&apos;entreprises à
            traiter.
          </p>
        </div>

        <div className="fr-table fr-table--bordered">
          <table>
            <thead>
              <tr>
                <th scope="col">Entreprise</th>
                <th scope="col">Métier recherché</th>
                <th scope="col">Date</th>
                <th scope="col">Statut</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>TechSolutions SARL</td>
                <td>Développeur web</td>
                <td>02/07/2025</td>
                <td>
                  <span className="fr-badge fr-badge--new">Nouveau</span>
                </td>
                <td>
                  <div className="fr-btns-group fr-btns-group--sm">
                    <button className="fr-btn fr-btn--sm">Répondre</button>
                    <button className="fr-btn fr-btn--secondary fr-btn--sm">
                      Voir détails
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>BatiPro SAS</td>
                <td>Électricien</td>
                <td>01/07/2025</td>
                <td>
                  <span className="fr-badge fr-badge--info">En cours</span>
                </td>
                <td>
                  <div className="fr-btns-group fr-btns-group--sm">
                    <button className="fr-btn fr-btn--sm">Répondre</button>
                    <button className="fr-btn fr-btn--secondary fr-btn--sm">
                      Voir détails
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>AutoMeca Industries</td>
                <td>Mécanicien automobile</td>
                <td>28/06/2025</td>
                <td>
                  <span className="fr-badge fr-badge--success">Acceptée</span>
                </td>
                <td>
                  <div className="fr-btns-group fr-btns-group--sm">
                    <button className="fr-btn fr-btn--tertiary fr-btn--sm">
                      Voir partenariat
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>RestauExpress</td>
                <td>Cuisinier</td>
                <td>25/06/2025</td>
                <td>
                  <span className="fr-badge fr-badge--error">Refusée</span>
                </td>
                <td>
                  <div className="fr-btns-group fr-btns-group--sm">
                    <button className="fr-btn fr-btn--tertiary fr-btn--sm">
                      Voir détails
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Filtres et options */}
        <div className="fr-mt-4w">
          <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--middle">
            <div className="fr-col-auto">
              <div className="fr-select-group">
                <label className="fr-label" htmlFor="filter-status">
                  Filtrer par statut :
                </label>
                <select className="fr-select" id="filter-status">
                  <option value="">Tous</option>
                  <option value="nouveau">Nouveau</option>
                  <option value="en-cours">En cours</option>
                  <option value="accepte">Acceptée</option>
                  <option value="refuse">Refusée</option>
                </select>
              </div>
            </div>
            <div className="fr-col-auto">
              <div className="fr-select-group">
                <label className="fr-label" htmlFor="filter-metier">
                  Filtrer par métier :
                </label>
                <select className="fr-select" id="filter-metier">
                  <option value="">Tous les métiers</option>
                  <option value="dev">Développeur web</option>
                  <option value="electricien">Électricien</option>
                  <option value="mecanicien">Mécanicien automobile</option>
                  <option value="cuisinier">Cuisinier</option>
                </select>
              </div>
            </div>
            <div className="fr-col-auto fr-ml-auto">
              <button className="fr-btn fr-btn--tertiary fr-btn--icon-left fr-icon-download-line">
                Exporter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conseils et aide */}
      <div className="fr-callout fr-callout--blue-ecume">
        <h4 className="fr-callout__title">
          <span
            className="fr-icon-information-line fr-mr-1w"
            aria-hidden="true"
          ></span>
          Conseils pour optimiser vos réponses
        </h4>
        <p>Pour améliorer votre attractivité auprès des entreprises :</p>
        <ul>
          <li>Répondez rapidement aux demandes (dans les 48h)</li>
          <li>
            Personnalisez vos réponses selon les besoins de l&apos;entreprise
          </li>
          <li>Mettez en avant vos atouts et spécialités</li>
          <li>Proposez des créneaux de visite ou de rencontre</li>
        </ul>
      </div>
    </div>
  );
}

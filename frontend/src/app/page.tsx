'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  const handleStartSearch = () => {
    router.push('/login');
  };

  return (
    <div className="fr-container-fluid">
      {/* Hero Section */}
      <section className="fr-py-6w fr-py-md-12w">
        <div className="fr-container">
          <div className="fr-grid-row fr-grid-row--center">
            <div className="fr-col-12 fr-col-md-10 fr-col-lg-8">
              
              <div className="fr-mb-4w">
                <p className="fr-badge fr-badge--blue-ecume">
                  <span className="fr-icon-award-line fr-mr-1w" aria-hidden="true"></span>
                  Service public d'orientation
                </p>
              </div>
              
              <h1 className="fr-h1 fr-mb-4w">
                Trouvez votre lycée professionnel
              </h1>
              
              <p className="fr-text--lead fr-mb-6w">
                Explorez les formations professionnelles disponibles près de chez vous grâce à notre service 
                de recherche personnalisée basé sur les données officielles du ministère de l'Éducation nationale.
              </p>

              <div className="fr-btns-group fr-btns-group--center">
                <button 
                  onClick={handleStartSearch}
                  className="fr-btn fr-btn--lg fr-btn--icon-left fr-icon-search-line"
                >
                  Commencer la recherche
                </button>
                <a 
                  href="#fonctionnalites"
                  className="fr-btn fr-btn--secondary fr-btn--lg fr-btn--icon-left fr-icon-information-line"
                >
                  En savoir plus
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="fr-py-6w" id="fonctionnalites">
        <div className="fr-container">
          <div className="fr-grid-row fr-grid-row--gutters">
            
            <div className="fr-col-12 fr-col-md-4">
              <div className="fr-card fr-card--no-arrow">
                <div className="fr-card__body">
                  <div className="fr-card__content">
                    <h3 className="fr-card__title">
                      <span className="fr-icon-search-line fr-mr-1w" aria-hidden="true"></span>
                      Recherche avancée
                    </h3>
                    <p className="fr-card__desc">
                      Filtrez par secteur d'activité, localisation géographique et critères spécifiques pour trouver la formation idéale.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="fr-col-12 fr-col-md-4">
              <div className="fr-card fr-card--no-arrow">
                <div className="fr-card__body">
                  <div className="fr-card__content">
                    <h3 className="fr-card__title">
                      <span className="fr-icon-map-pin-2-line fr-mr-1w" aria-hidden="true"></span>
                      Géolocalisation précise
                    </h3>
                    <p className="fr-card__desc">
                      Localisez automatiquement les établissements les plus proches de votre domicile avec calcul des distances.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="fr-col-12 fr-col-md-4">
              <div className="fr-card fr-card--no-arrow">
                <div className="fr-card__body">
                  <div className="fr-card__content">
                    <h3 className="fr-card__title">
                      <span className="fr-icon-file-text-line fr-mr-1w" aria-hidden="true"></span>
                      Données officielles
                    </h3>
                    <p className="fr-card__desc">
                      Accédez aux informations complètes et vérifiées des établissements et de leurs formations.
                    </p>
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
              <h3 className="fr-h3 fr-mb-4w">À propos de ce service</h3>
              
              <div className="fr-grid-row fr-grid-row--gutters">
                <div className="fr-col-12 fr-col-md-6">
                  <p className="fr-text--lg fr-mb-4w">
                    Ce service utilise les données officielles du ministère de l'Éducation nationale 
                    pour vous proposer une recherche personnalisée et fiable des lycées professionnels.
                  </p>
                  <p>
                    Développé dans le cadre d'un projet éducatif, il vise à faciliter l'orientation 
                    des élèves vers les formations professionnelles qui correspondent à leurs aspirations.
                  </p>
                </div>
                
                <div className="fr-col-12 fr-col-md-6">
                  <div className="fr-callout">
                    <h4 className="fr-callout__title">Fonctionnalités principales</h4>
                    <ul>
                      <li>Recherche par secteur d'activité</li>
                      <li>Filtrage géographique avancé</li>
                      <li>Informations détaillées des établissements</li>
                      <li>Interface accessible et intuitive</li>
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

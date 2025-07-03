'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();

  const handleCreateDemande = () => {
    router.push('/demandes');
  };

  const handleSearch = () => {
    router.push('/search');
  };

  const handleDashboard = () => {
    router.push('/dashboard');
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
                  Plateforme de partenariat éducatif
                </p>
              </div>
              
              <h1 className="fr-h1 fr-mb-4w">
                Connectons entreprises et lycées professionnels
              </h1>
              
              <p className="fr-text--lead fr-mb-6w">
                Une plateforme dédiée aux partenariats entre le monde professionnel et l&apos;enseignement technique. 
                Créez des collaborations durables pour l&apos;insertion professionnelle des jeunes.
              </p>

                             {!isAuthenticated ? (
                 // Section choix de profil pour non-connectés
                 <div className="fr-mb-6w">
                   <h3 className="fr-h3 fr-mb-4w">Je suis :</h3>
                   <div className="fr-grid-row fr-grid-row--gutters">
                     <div className="fr-col-12 fr-col-md-6">
                       <div className="fr-card fr-card--horizontal">
                         <div className="fr-card__body">
                           <div className="fr-card__content">
                             <h4 className="fr-card__title">
                               <span className="fr-icon-building-line fr-mr-1w" aria-hidden="true"></span>
                               Une entreprise
                             </h4>
                             <p className="fr-card__desc">
                               Je souhaite créer des partenariats avec des lycées professionnels pour des stages, alternances ou projets.
                             </p>
                             <div className="fr-card__footer">
                               <button 
                                 className="fr-btn fr-btn--lg fr-btn--icon-left fr-icon-login-box-line"
                                 onClick={() => router.push('/auth?type=entreprise')}
                               >
                                 Se connecter
                               </button>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>
                     
                     <div className="fr-col-12 fr-col-md-6">
                       <div className="fr-card fr-card--horizontal">
                         <div className="fr-card__body">
                           <div className="fr-card__content">
                             <h4 className="fr-card__title">
                               <span className="fr-icon-school-line fr-mr-1w" aria-hidden="true"></span>
                               Un lycée professionnel
                             </h4>
                             <p className="fr-card__desc">
                               Je représente un établissement et je souhaite développer des partenariats avec les entreprises.
                             </p>
                             <div className="fr-card__footer">
                               <button 
                                 className="fr-btn fr-btn--lg fr-btn--icon-left fr-icon-login-box-line"
                                 onClick={() => router.push('/auth?type=lycee')}
                               >
                                 Se connecter
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
                       <span className="fr-icon-user-line fr-mr-1w" aria-hidden="true"></span>
                       Connecté en tant que {user?.type === 'entreprise' ? 'Entreprise' : 'Lycée'}
                     </h3>
                     <p className="fr-callout__text">
                       Bienvenue {user?.name} ! Utilisez le menu en haut à droite pour accéder à vos fonctionnalités.
                     </p>
                   </div>
                   
                   <div className="fr-btns-group fr-btns-group--center fr-mt-4w">
                     <button 
                       onClick={handleDashboard}
                       className="fr-btn fr-btn--lg fr-btn--icon-left fr-icon-dashboard-line"
                     >
                       Mon tableau de bord
                     </button>
                     
                     {user?.type === 'entreprise' ? (
                       <>
                         <button 
                           onClick={handleCreateDemande}
                           className="fr-btn fr-btn--secondary fr-btn--lg fr-btn--icon-left fr-icon-add-line"
                         >
                           Créer une demande
                         </button>
                         <button 
                           onClick={handleSearch}
                           className="fr-btn fr-btn--tertiary fr-btn--lg fr-btn--icon-left fr-icon-search-line"
                         >
                           Rechercher lycées
                         </button>
                         <button 
                           onClick={() => router.push('/lycees/profils')}
                           className="fr-btn fr-btn--tertiary fr-btn--lg fr-btn--icon-left fr-icon-building-line"
                         >
                           Profils lycées
                         </button>
                       </>
                     ) : (
                       <>
                         <button 
                           onClick={() => router.push('/lycee')}
                           className="fr-btn fr-btn--secondary fr-btn--lg fr-btn--icon-left fr-icon-school-line"
                         >
                           Mon lycée
                         </button>
                         <button 
                           onClick={() => router.push('/lycee/profil')}
                           className="fr-btn fr-btn--tertiary fr-btn--lg fr-btn--icon-left fr-icon-settings-5-line"
                         >
                           Gérer mon profil
                         </button>
                       </>
                     )}
                     
                     <button 
                       onClick={logout}
                       className="fr-btn fr-btn--tertiary fr-btn--lg fr-btn--icon-left fr-icon-logout-box-r-line"
                     >
                       Se déconnecter
                     </button>
                   </div>
                 </div>
               )}
              
              <div className="fr-btns-group fr-btns-group--center">
                <a 
                  href="#fonctionnalites"
                  className="fr-btn fr-btn--tertiary fr-btn--icon-left fr-icon-information-line"
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
              <h2 className="fr-h2 fr-mb-4w">Une plateforme complète pour tous</h2>
              <p className="fr-text--lead">
                Que vous représentiez une entreprise ou un lycée professionnel, 
                notre plateforme facilite la création de partenariats durables.
              </p>
            </div>
          </div>
          
         
          

          {/* Fonctionnalités techniques */}
          <div className="fr-grid-row fr-grid-row--gutters fr-mt-6w">
            <div className="fr-col-12 fr-col-md-4">
              <div className="fr-card fr-card--no-arrow">
                <div className="fr-card__body">
                  <div className="fr-card__content">
                    <h4 className="fr-card__title">
                      <span className="fr-icon-database-2-line fr-mr-1w" aria-hidden="true"></span>
                      Matching intelligent
                    </h4>
                    <p className="fr-card__desc">
                      Algorithme de correspondance automatique entre les besoins des entreprises et les spécialités des lycées.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="fr-col-12 fr-col-md-4">
              <div className="fr-card fr-card--no-arrow">
                <div className="fr-card__body">
                  <div className="fr-card__content">
                    <h4 className="fr-card__title">
                      <span className="fr-icon-map-pin-2-line fr-mr-1w" aria-hidden="true"></span>
                      Géolocalisation
                    </h4>
                    <p className="fr-card__desc">
                      Trouvez les partenaires les plus proches géographiquement pour faciliter les échanges.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="fr-col-12 fr-col-md-4">
              <div className="fr-card fr-card--no-arrow">
                <div className="fr-card__body">
                  <div className="fr-card__content">
                    <h4 className="fr-card__title">
                      <span className="fr-icon-file-text-line fr-mr-1w" aria-hidden="true"></span>
                      Suivi des partenariats
                    </h4>
                    <p className="fr-card__desc">
                      Dashboard complet pour suivre l'évolution de vos demandes et collaborations en cours.
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
              <h3 className="fr-h3 fr-mb-4w">Une plateforme au service de l'insertion professionnelle</h3>
              
              <div className="fr-grid-row fr-grid-row--gutters">
                <div className="fr-col-12 fr-col-md-6">
                  <p className="fr-text--lg fr-mb-4w">
                    Notre plateforme connecte le monde de l&apos;entreprise et l&apos;enseignement professionnel 
                    pour créer des opportunités d&apos;insertion réussies pour les jeunes.
                  </p>
                  <p>
                    Basée sur les données officielles du ministère de l&apos;Éducation nationale, 
                    elle facilite la mise en relation et le suivi des partenariats éducatifs.
                  </p>
                </div>
                
                <div className="fr-col-12 fr-col-md-6">
                  <div className="fr-callout">
                    <h4 className="fr-callout__title">Fonctionnalités clés</h4>
                    <ul>
                      <li> Mise en relation entreprises/lycées</li>
                      <li> Gestion des demandes de partenariat</li>
                      <li> Matching automatique par secteur</li>
                      <li> Tableau de bord de suivi</li>
                      <li> Recherche géographique avancée</li>
                      <li> Authentification sécurisée</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Call to action */}
              <div className="fr-grid-row fr-grid-row--center fr-mt-6w">
                <div className="fr-col-12 fr-col-md-8">
                  <div className="fr-card fr-card--horizontal fr-card--blue-ecume">
                    <div className="fr-card__body">
                      <div className="fr-card__content">
                        <h4 className="fr-card__title">Prêt à commencer ?</h4>
                        <p className="fr-card__desc">
                          Rejoignez notre communauté et créez vos premiers partenariats dès aujourd'hui.
                        </p>
                        <div className="fr-btns-group">
                          <button 
                            className="fr-btn fr-btn--secondary"
                            onClick={() => router.push('/auth?type=entreprise')}
                          >
                            Je suis une entreprise
                          </button>
                          <button 
                            className="fr-btn fr-btn--secondary"
                            onClick={() => router.push('/auth?type=lycee')}
                          >
                            Je suis un lycée
                          </button>
                        </div>
                      </div>
                    </div>
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

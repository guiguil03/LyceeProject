'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface LyceeProfile {
  numero_uai: string;
  nom_etablissement: string;
  libelle_commune: string;
  libelle_departement: string;
  libelle_region: string;
  adresse: string;
  code_postal: string;
  secteur_public_prive_libe: string;
  formations?: string[];
  telephone?: string;
  mail?: string;
  web?: string;
  latitude?: number;
  longitude?: number;
}

export default function LyceesProfilsPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'nom' | 'uai' | 'ville'>('nom');
  const [lycees, setLycees] = useState<LyceeProfile[]>([]);
  const [selectedLycee, setSelectedLycee] = useState<LyceeProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // 9 lycées par page (3x3 grille)

  // Calculs pour la pagination
  const totalPages = Math.ceil(lycees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLycees = lycees.slice(startIndex, endIndex);

  // Fonction pour générer les numéros de pages à afficher
  const getPageNumbers = () => {
    const delta = 2; // Nombre de pages à afficher de chaque côté de la page actuelle
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter((item, index, array) => array.indexOf(item) === index);
  };

  // Vérification d'authentification
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.type !== 'entreprise')) {
      router.push('/auth?type=entreprise');
    }
  }, [isAuthenticated, user, isLoading, router]);

  // Réinitialiser la page à 1 quand on change les résultats
  useEffect(() => {
    setCurrentPage(1);
  }, [lycees]);

  if (isLoading) {
    return (
      <div className="fr-container fr-py-6w">
        <div className="fr-text--center">
          <span className="fr-icon-refresh-line fr-icon--rotating fr-mr-2w"></span>
          Chargement...
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.type !== 'entreprise') {
    return null;
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Veuillez saisir un terme de recherche');
      return;
    }

    setLoading(true);
    setError(null);
    setLycees([]);
    setSelectedLycee(null);
    setCurrentPage(1); // Réinitialiser à la page 1

    try {
      console.log('🔍 Recherche lycées:', { query: searchQuery, type: searchType });

      // Appel à l'API lycées
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      let url = '';
      
      switch (searchType) {
        case 'nom':
          url = `${apiUrl}/api/lycees/search?search=${encodeURIComponent(searchQuery)}`;
          break;
        case 'uai':
          url = `${apiUrl}/api/lycees/${encodeURIComponent(searchQuery)}`;
          break;
        case 'ville':
          url = `${apiUrl}/api/lycees/search?commune=${encodeURIComponent(searchQuery)}`;
          break;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      
      if (data.success) {
        if (searchType === 'uai' && data.data) {
          // Résultat unique pour recherche par UAI
          setLycees([data.data]);
        } else if (data.data && Array.isArray(data.data)) {
          // Résultats multiples pour recherche par nom ou ville
          setLycees(data.data);
        } else {
          setLycees([]);
        }
        console.log('✅ Lycées trouvés:', data.data);
      } else {
        throw new Error(data.message || 'Erreur lors de la recherche');
      }
    } catch (err) {
      console.error('❌ Erreur recherche:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche');
      setLycees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLyceeSelect = (lycee: LyceeProfile) => {
    setSelectedLycee(lycee);
  };

  const handleCreateDemande = (lycee: LyceeProfile) => {
    // Rediriger vers la page de création de demande avec le lycée pré-sélectionné
    router.push(`/demandes?lycee_uai=${lycee.numero_uai}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Faire défiler vers le haut de la section des résultats
    const resultsSection = document.getElementById('search-results');
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fr-container fr-py-6w">
      {/* En-tête */}
      <div className="fr-mb-6w">
        <h1 className="fr-h1">
          <span className="fr-icon-building-line fr-mr-2w" aria-hidden="true"></span>
          Profils des lycées professionnels
        </h1>
        <p className="fr-text--lead">
          Recherchez et consultez les profils des lycées professionnels par nom, UAI ou ville.
        </p>
      </div>

      {/* Formulaire de recherche */}
      <div className="fr-card fr-mb-6w">
        <div className="fr-card__body">
          <div className="fr-card__content">
            <h2 className="fr-card__title">
              <span className="fr-icon-search-line fr-mr-2w" aria-hidden="true"></span>
              Rechercher un lycée
            </h2>

            <div className="fr-grid-row fr-grid-row--gutters fr-mb-4w">
              {/* Type de recherche */}
              <div className="fr-col-12 fr-col-md-4">
                <div className="fr-select-group">
                  <label className="fr-label" htmlFor="search-type">
                    Type de recherche
                  </label>
                  <select
                    className="fr-select"
                    id="search-type"
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as 'nom' | 'uai' | 'ville')}
                  >
                    <option value="nom">Par nom d&apos;établissement</option>
                    <option value="uai">Par code UAI</option>
                    <option value="ville">Par ville</option>
                  </select>
                </div>
              </div>

              {/* Champ de recherche */}
              <div className="fr-col-12 fr-col-md-6">
                <div className="fr-input-group">
                  <label className="fr-label" htmlFor="search-query">
                    {searchType === 'nom' && 'Nom de l&apos;établissement'}
                    {searchType === 'uai' && 'Code UAI (ex: 0751234A)'}
                    {searchType === 'ville' && 'Nom de la ville'}
                  </label>
                  <input
                    className="fr-input"
                    type="text"
                    id="search-query"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      searchType === 'nom' ? 'Lycée professionnel...' :
                      searchType === 'uai' ? '0751234A' :
                      'Paris, Lyon, Marseille...'
                    }
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>

              {/* Bouton de recherche */}
              <div className="fr-col-12 fr-col-md-2">
                <label className="fr-label">&nbsp;</label>
                <button
                  onClick={handleSearch}
                  disabled={loading || !searchQuery.trim()}
                  className={`fr-btn fr-btn--icon-left ${
                    loading ? 'fr-icon-refresh-line fr-icon--rotating' : 'fr-icon-search-line'
                  }`}
                  style={{ marginTop: '0.5rem' }}
                >
                  {loading ? 'Recherche...' : 'Rechercher'}
                </button>
              </div>
            </div>

            {/* Aide contextuelle */}
            <div className="fr-callout fr-callout--blue-ecume">
              <p className="fr-callout__text">
                <span className="fr-icon-information-line fr-mr-1w" aria-hidden="true"></span>
                <strong>Conseil :</strong> 
                {searchType === 'nom' && ' Vous pouvez rechercher par une partie du nom de l&apos;établissement.'}
                {searchType === 'uai' && ' Le code UAI est un identifiant unique de 8 caractères (7 chiffres + 1 lettre).'}
                {searchType === 'ville' && ' La recherche par ville affichera tous les lycées professionnels de cette commune.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gestion des erreurs */}
      {error && (
        <div className="fr-alert fr-alert--error fr-mb-4w">
          <h3 className="fr-alert__title">Erreur de recherche</h3>
          <p>{error}</p>
        </div>
      )}

      {/* Résultats de recherche */}
      {lycees.length > 0 && (
        <div id="search-results" className="fr-card fr-mb-6w">
          <div className="fr-card__body">
            <div className="fr-card__content">
              <div className="fr-grid-row fr-grid-row--gutters fr-mb-4w">
                <div className="fr-col-auto">
                  <h2 className="fr-card__title">
                    <span className="fr-icon-list-unordered fr-mr-2w" aria-hidden="true"></span>
                    Résultats de recherche ({lycees.length} lycée{lycees.length > 1 ? 's' : ''})
                  </h2>
                </div>
                <div className="fr-col-auto fr-ml-auto">
                  <p className="fr-text--sm fr-mb-0">
                    Page {currentPage} sur {totalPages} • Affichage de {startIndex + 1} à {Math.min(endIndex, lycees.length)} lycées
                  </p>
                </div>
              </div>

              <div className="fr-grid-row fr-grid-row--gutters">
                {currentLycees.map((lycee) => (
                  <div key={lycee.numero_uai} className="fr-col-12 fr-col-md-6 fr-col-lg-4">
                    <div className="fr-card fr-card--sm">
                      <div className="fr-card__body">
                        <div className="fr-card__content">
                          <h3 className="fr-card__title">{lycee.nom_etablissement}</h3>
                          <p className="fr-card__desc">
                            <span className="fr-icon-map-pin-2-line fr-mr-1w" aria-hidden="true"></span>
                            {lycee.libelle_commune} ({lycee.libelle_departement})
                          </p>
                          
                          <ul className="fr-list fr-text--sm">
                            <li><strong>UAI :</strong> {lycee.numero_uai}</li>
                            <li><strong>Type :</strong> {lycee.secteur_public_prive_libe}</li>
                            {lycee.code_postal && (
                              <li><strong>Code postal :</strong> {lycee.code_postal}</li>
                            )}
                          </ul>

                          <div className="fr-btns-group fr-btns-group--sm fr-mt-3w">
                            <button
                              onClick={() => handleLyceeSelect(lycee)}
                              className="fr-btn fr-btn--sm fr-btn--icon-left fr-icon-eye-line"
                            >
                              Voir le profil
                            </button>
                            <button
                              onClick={() => handleCreateDemande(lycee)}
                              className="fr-btn fr-btn--sm fr-btn--secondary fr-btn--icon-left fr-icon-mail-line"
                            >
                              Contacter
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="fr-mt-6w">
                  <nav role="navigation" className="fr-pagination" aria-label="Pagination de la navigation">
                    <ul className="fr-pagination__list">
                      {/* Bouton Précédent */}
                      <li>
                        <button
                          className="fr-pagination__link fr-pagination__link--prev fr-pagination__link--lg-label"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          aria-disabled={currentPage === 1}
                        >
                          Précédent
                        </button>
                      </li>

                      {/* Numéros de pages */}
                      {getPageNumbers().map((pageNumber, index) => {
                        if (pageNumber === '...') {
                          return (
                            <li key={`dots-${index}`}>
                              <span className="fr-pagination__link">…</span>
                            </li>
                          );
                        }

                        const isCurrentPage = pageNumber === currentPage;
                        return (
                          <li key={pageNumber}>
                            <button
                              className={`fr-pagination__link ${isCurrentPage ? 'fr-pagination__link--current' : ''}`}
                              onClick={() => handlePageChange(pageNumber as number)}
                              aria-current={isCurrentPage ? 'page' : undefined}
                              title={`Aller à la page ${pageNumber}`}
                            >
                              {pageNumber}
                            </button>
                          </li>
                        );
                      })}

                      {/* Bouton Suivant */}
                      <li>
                        <button
                          className="fr-pagination__link fr-pagination__link--next fr-pagination__link--lg-label"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          aria-disabled={currentPage === totalPages}
                        >
                          Suivant
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Détail du lycée sélectionné */}
      {selectedLycee && (
        <div className="fr-card">
          <div className="fr-card__body">
            <div className="fr-card__content">
              <div className="fr-grid-row fr-grid-row--gutters fr-mb-4w">
                <div className="fr-col-auto">
                  <h2 className="fr-card__title">{selectedLycee.nom_etablissement}</h2>
                </div>
                <div className="fr-col-auto fr-ml-auto">
                  <button
                    onClick={() => setSelectedLycee(null)}
                    className="fr-btn fr-btn--tertiary fr-btn--sm fr-btn--icon-left fr-icon-close-line"
                  >
                    Fermer
                  </button>
                </div>
              </div>

              <div className="fr-grid-row fr-grid-row--gutters">
                {/* Informations générales */}
                <div className="fr-col-12 fr-col-md-6">
                  <h3 className="fr-h5">
                    <span className="fr-icon-information-line fr-mr-2w" aria-hidden="true"></span>
                    Informations générales
                  </h3>
                  
                  <dl className="fr-list">
                    <dt><strong>Code UAI :</strong></dt>
                    <dd>{selectedLycee.numero_uai}</dd>
                    
                    <dt><strong>Type d&apos;établissement :</strong></dt>
                    <dd>
                      <span className={`fr-badge ${
                        selectedLycee.secteur_public_prive_libe === 'Public' ? 'fr-badge--blue-france' : 'fr-badge--purple-glycine'
                      }`}>
                        {selectedLycee.secteur_public_prive_libe}
                      </span>
                    </dd>
                    
                    <dt><strong>Adresse :</strong></dt>
                    <dd>
                      {selectedLycee.adresse}<br />
                      {selectedLycee.code_postal} {selectedLycee.libelle_commune}<br />
                      {selectedLycee.libelle_departement}, {selectedLycee.libelle_region}
                    </dd>
                  </dl>
                </div>

                {/* Contact et actions */}
                <div className="fr-col-12 fr-col-md-6">
                  <h3 className="fr-h5">
                    <span className="fr-icon-mail-line fr-mr-2w" aria-hidden="true"></span>
                    Contact et actions
                  </h3>
                  
                  {(selectedLycee.telephone || selectedLycee.mail || selectedLycee.web) && (
                    <dl className="fr-list fr-mb-4w">
                      {selectedLycee.telephone && (
                        <>
                          <dt><strong>Téléphone :</strong></dt>
                          <dd>{selectedLycee.telephone}</dd>
                        </>
                      )}
                      {selectedLycee.mail && (
                        <>
                          <dt><strong>Email :</strong></dt>
                          <dd>{selectedLycee.mail}</dd>
                        </>
                      )}
                      {selectedLycee.web && (
                        <>
                          <dt><strong>Site web :</strong></dt>
                          <dd>
                            <a href={selectedLycee.web} target="_blank" rel="noopener noreferrer" className="fr-link">
                              {selectedLycee.web}
                            </a>
                          </dd>
                        </>
                      )}
                    </dl>
                  )}

                  <div className="fr-btns-group">
                    <button
                      onClick={() => handleCreateDemande(selectedLycee)}
                      className="fr-btn fr-btn--icon-left fr-icon-mail-send-line"
                    >
                      Créer une demande de partenariat
                    </button>
                  </div>
                </div>
              </div>

              {/* Formations (si disponibles) */}
              {selectedLycee.formations && selectedLycee.formations.length > 0 && (
                <div className="fr-mt-6w">
                  <h3 className="fr-h5">
                    <span className="fr-icon-award-line fr-mr-2w" aria-hidden="true"></span>
                    Formations proposées
                  </h3>
                  <div className="fr-tags-group">
                    {selectedLycee.formations.map((formation, index) => (
                      <span key={index} className="fr-tag">{formation}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* État vide après recherche */}
      {!loading && !error && lycees.length === 0 && searchQuery && (
        <div className="fr-card">
          <div className="fr-card__body">
            <div className="fr-card__content fr-text--center fr-py-6w">
              <span className="fr-icon-search-line" style={{ fontSize: '3rem', color: '#666' }} aria-hidden="true"></span>
              <h3 className="fr-h5 fr-mt-2w">Aucun lycée trouvé</h3>
              <p className="fr-mb-4w">
                Aucun établissement ne correspond à votre recherche &quot;{searchQuery}&quot;.
              </p>
              <div className="fr-callout fr-callout--blue-ecume">
                <p className="fr-callout__text">
                  <strong>Suggestions :</strong><br />
                  • Vérifiez l&apos;orthographe de votre recherche<br />
                  • Essayez avec une partie du nom seulement<br />
                  • Changez le type de recherche (nom, UAI, ville)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
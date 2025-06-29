import React, { useState } from 'react';
import type { MatchingCriteria, MatchingResponse, MatchingResult } from '../types/api';

const MatchingLycees: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MatchingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [criteria, setCriteria] = useState<MatchingCriteria>({
    entreprise: {
      secteurActivite: '',
      localisation: {
        commune: '',
        departement: '',
        codePostal: ''
      }
    },
    preferences: {
      distanceMax: 50,
      typeEtablissement: 'tous',
      nombreResultats: 10
    }
  });

  const handleSearch = async () => {
    if (!criteria.entreprise?.secteurActivite && !criteria.entreprise?.siret) {
      setError('Veuillez renseigner au minimum un secteur d\'activité ou un SIRET');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log('🔍 Recherche avec critères:', criteria);
      
      const response = await fetch('http://localhost:3001/api/matching', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(criteria),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setResults(data.data);
        console.log('✅ Résultats:', data.data.matches?.length || 0, 'lycées trouvés');
      } else {
        throw new Error(data.message || 'Erreur lors de la recherche');
      }
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section avec titre */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
          🎓 Trouvez vos futurs alternants
        </div>
        <h1 className="text-4xl font-light text-gray-900 mb-4">
          Découvrez les lycées professionnels qui correspondent à votre secteur d'activité
        </h1>
      </div>

      {/* Formulaire de recherche moderne */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header du formulaire */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                Critères de recherche
              </h2>
              <p className="text-gray-600 mt-1">Personnalisez votre recherche selon vos préférences</p>
            </div>
          </div>
        </div>

        {/* Contenu du formulaire */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Section Entreprise */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Votre entreprise</h3>
              </div>
              
              {/* SIRET Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  SIRET (optionnel)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={criteria.entreprise?.siret || ''}
                    onChange={(e) => setCriteria(prev => ({
                      ...prev,
                      entreprise: { ...prev.entreprise, siret: e.target.value }
                    }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Saisissez le SIRET de votre entreprise"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                
                {/* SIRETs de démonstration */}
                <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-amber-800 mb-2">SIRETs de démonstration :</p>
                      <div className="text-xs text-amber-700 space-y-1">
                        <div>• <span className="font-mono">78467169500015</span> (Informatique - Paris)</div>
                        <div>• <span className="font-mono">12345678901234</span> (Commerce - Meaux)</div>
                        <div>• <span className="font-mono">98765432109876</span> (Bâtiment - Torcy)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secteur d'activité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Secteur d'activité <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={criteria.entreprise?.secteurActivite || ''}
                    onChange={(e) => setCriteria(prev => ({
                      ...prev,
                      entreprise: { ...prev.entreprise, secteurActivite: e.target.value }
                    }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                    required
                  >
                    <option value="">Sélectionnez un secteur</option>
                    <option value="informatique">💻 Informatique et numérique</option>
                    <option value="commerce">🛍️ Commerce et vente</option>
                    <option value="industrie">🏭 Industrie et production</option>
                    <option value="batiment">🏗️ Bâtiment et travaux publics</option>
                    <option value="restauration">🍽️ Restauration et hôtellerie</option>
                    <option value="transport">🚛 Transport et logistique</option>
                    <option value="sante">🏥 Santé et social</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Localisation */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Localisation</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Commune</label>
                  <input
                    type="text"
                    value={criteria.entreprise?.localisation?.commune || ''}
                    onChange={(e) => setCriteria(prev => ({
                      ...prev,
                      entreprise: {
                        ...prev.entreprise,
                        localisation: { ...prev.entreprise?.localisation, commune: e.target.value }
                      }
                    }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Paris"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Département</label>
                  <input
                    type="text"
                    value={criteria.entreprise?.localisation?.departement || ''}
                    onChange={(e) => setCriteria(prev => ({
                      ...prev,
                      entreprise: {
                        ...prev.entreprise,
                        localisation: { ...prev.entreprise?.localisation, departement: e.target.value }
                      }
                    }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Paris"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Code postal</label>
                <input
                  type="text"
                  value={criteria.entreprise?.localisation?.codePostal || ''}
                  onChange={(e) => setCriteria(prev => ({
                    ...prev,
                    entreprise: {
                      ...prev.entreprise,
                      localisation: { ...prev.entreprise?.localisation, codePostal: e.target.value }
                    }
                  }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="75015"
                />
              </div>
            </div>
          </div>

          {/* Préférences de recherche */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Préférences de recherche</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Distance maximale (km)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={criteria.preferences?.distanceMax || 50}
                    onChange={(e) => setCriteria(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, distanceMax: parseInt(e.target.value) || 50 }
                    }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-sm text-gray-500">km</span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">Zone de recherche autour de votre entreprise</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Type d'établissement
                </label>
                <div className="relative">
                  <select
                    value={criteria.preferences?.typeEtablissement || 'tous'}
                    onChange={(e) => setCriteria(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, typeEtablissement: e.target.value as 'tous' | 'public' | 'prive' }
                    }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                  >
                    <option value="tous">Tous les types</option>
                    <option value="public">Public uniquement</option>
                    <option value="prive">Privé uniquement</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nombre de résultats
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={criteria.preferences?.nombreResultats || 10}
                    onChange={(e) => setCriteria(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, nombreResultats: parseInt(e.target.value) || 10 }
                    }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">Maximum de lycées à afficher</p>
              </div>
            </div>
          </div>

          {/* Bouton de recherche */}
          <div className="mt-12 flex justify-center">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-4 px-12 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed flex items-center gap-3"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Recherche en cours...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Trouver des lycées
                </>
              )}
            </button>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Affichage des résultats */}
      {results && (
        <div className="mt-12 space-y-6">
          {/* Informations sur l'entreprise */}
          {results.entreprise && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-8 border border-blue-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  🏢 Entreprise trouvée via API INSEE
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    ✓ Données officielles
                  </span>
                </h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Informations principales */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      📋 Informations générales
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Dénomination sociale</label>
                        <p className="text-xl font-bold text-gray-900 mt-1">
                          {results.entreprise.denominationSociale}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">SIRET</label>
                        <p className="text-lg font-mono text-gray-800 mt-1 bg-gray-50 px-3 py-1 rounded">
                          {results.entreprise.siret}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          SIREN: {results.entreprise.siret.substring(0, 9)}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Secteur d'activité</label>
                        <p className="text-lg text-blue-700 font-semibold mt-1 bg-blue-50 px-3 py-2 rounded-lg">
                          {results.entreprise.secteurActivite}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Adresse et localisation */}
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      📍 Localisation
                    </h4>
                    <div className="space-y-3">
                      {results.entreprise.adresse && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Localisation</label>
                          <div className="mt-1 text-gray-800">
                            <p className="text-lg font-semibold text-blue-600">
                              {results.entreprise.adresse.codePostal} {results.entreprise.adresse.commune}
                            </p>
                            <p className="text-gray-600">
                              {results.entreprise.adresse.departement}
                            </p>
                          </div>
                        </div>
                      )}

                      {results.entreprise.coordonnees && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Coordonnées GPS</label>
                          <div className="mt-1 text-sm text-gray-600 bg-gray-50 p-2 rounded font-mono">
                            <p>Lat: {results.entreprise.coordonnees.latitude?.toFixed(4)}</p>
                            <p>Lng: {results.entreprise.coordonnees.longitude?.toFixed(4)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Source des données */}
              <div className="mt-6 pt-4 border-t border-blue-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">ℹ️</span>
                    <span>Données provenant de l'API SIRENE officielle de l'INSEE</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Mise à jour en temps réel
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Résultats des lycées */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                🎯 Lycées correspondants ({results.matches?.length || 0})
              </h3>
              <div className="text-sm text-gray-500">
                Triés par pertinence
              </div>
            </div>

            {results.matches && results.matches.length > 0 ? (
              <div className="grid gap-6">
                {results.matches.map((match, index) => (
                  <LyceeCard key={match.lycee.numero_uai} match={match} rank={index + 1} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-500 text-lg mb-2">Aucun lycée trouvé avec ces critères</p>
                <p className="text-gray-400 text-sm">Essayez d'élargir vos critères de recherche</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Composant pour afficher une carte de lycée améliorée
const LyceeCard: React.FC<{ match: MatchingResult; rank: number }> = ({ match, rank }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500 text-white';
    if (rank === 2) return 'bg-gray-400 text-white';
    if (rank === 3) return 'bg-amber-600 text-white';
    return 'bg-blue-600 text-white';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold ${getRankColor(rank)}`}>
              {rank}
            </span>
            <div>
              <h4 className="text-lg font-semibold text-gray-800">
                {match.lycee.nom_etablissement}
              </h4>
              <p className="text-gray-600 text-sm">{match.lycee.type_etablissement}</p>
            </div>
          </div>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            📍 {match.lycee.libelle_commune}, {match.lycee.libelle_departement}
            {match.distance && (
              <span className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">
                📏 {match.distance} km
              </span>
            )}
          </p>
        </div>
        
      
      </div>

      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {match.motifs.map((motif, idx) => (
            <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-200">
              {motif}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors"
      >
        {showDetails ? '▼ Masquer les détails' : '▶ Voir les détails'}
      </button>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p><strong>UAI:</strong> {match.lycee.numero_uai}</p>
              <p><strong>Statut:</strong> 
                <span className={`ml-1 px-2 py-1 rounded text-xs ${
                  match.lycee.statut_public_prive === 'Public' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {match.lycee.statut_public_prive}
                </span>
              </p>
              <p><strong>Adresse:</strong> {match.lycee.adresse_1}</p>
              <p><strong>Code postal:</strong> {match.lycee.code_postal_uai}</p>
            </div>
            <div className="space-y-2">
              {match.lycee.telephone && (
                <p><strong>📞 Téléphone:</strong> 
                  <a href={`tel:${match.lycee.telephone}`} className="text-blue-600 hover:underline ml-1">
                    {match.lycee.telephone}
                  </a>
                </p>
              )}
              {match.lycee.mail && (
                <p><strong>📧 Email:</strong> 
                  <a href={`mailto:${match.lycee.mail}`} className="text-blue-600 hover:underline ml-1">
                    {match.lycee.mail}
                  </a>
                </p>
              )}
              {match.lycee.web && (
                <p><strong>🌐 Site web:</strong> 
                  <a href={match.lycee.web} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                    Visiter
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchingLycees;

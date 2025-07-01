'use client';

import React, { useState } from 'react';

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

const MatchingLycees: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [entrepriseInfo, setEntrepriseInfo] = useState<any>(null);
  
  const [criteria, setCriteria] = useState<MatchingCriteria>({
    entreprise: {
      secteurActivite: '',
      siret: '',
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
    setEntrepriseInfo(null);

    try {
      console.log('🔍 Recherche avec critères:', criteria);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/matching`, {
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
        console.log('✅ Résultats reçus:', data.data);
        console.log('✅ Nombre de lycées:', data.data.matches?.length || 0);
        
        setResults(data.data.matches || []);
        setEntrepriseInfo(data.data.entreprise || null);
        setError(null);
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
          Découvrez les lycées professionnels qui correspondent à votre secteur d&apos;activité
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                    placeholder="Saisissez le SIRET de votre entreprise"
                  />
                </div>
              </div>

              {/* Secteur d'activité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Secteur d&apos;activité <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={criteria.entreprise?.secteurActivite || ''}
                    onChange={(e) => setCriteria(prev => ({
                      ...prev,
                      entreprise: { ...prev.entreprise, secteurActivite: e.target.value }
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white text-gray-900"
                    required
                  >
                    <option value="" className="text-gray-500">Sélectionnez un secteur</option>
                    <option value="informatique" className="text-gray-900">💻 Informatique et numérique</option>
                    <option value="commerce" className="text-gray-900">🛍️ Commerce et vente</option>
                    <option value="industrie" className="text-gray-900">🏭 Industrie et production</option>
                    <option value="batiment" className="text-gray-900">🏗️ Bâtiment et travaux publics</option>
                    <option value="restauration" className="text-gray-900">🍽️ Restauration et hôtellerie</option>
                    <option value="transport" className="text-gray-900">🚛 Transport et logistique</option>
                    <option value="sante" className="text-gray-900">🏥 Santé et social</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Localisation et Préférences */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Localisation et Préférences</h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Commune</label>
                <input
                  type="text"
                  value={criteria.entreprise?.localisation?.commune || ''}
                  onChange={(e) => setCriteria(prev => ({
                    ...prev,
                    entreprise: { 
                      ...prev.entreprise, 
                      localisation: { 
                        ...prev.entreprise?.localisation, 
                        commune: e.target.value 
                      } 
                    }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                  placeholder="Paris, Lyon, Marseille..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Distance maximale (km)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={criteria.preferences?.distanceMax || 50}
                    onChange={(e) => setCriteria(prev => ({
                      ...prev,
                      preferences: { 
                        ...prev.preferences, 
                        distanceMax: parseInt(e.target.value) || 50
                      }
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Nombre de lycées souhaités
                  </label>
                  <div className="relative">
                    <select
                      value={criteria.preferences?.nombreResultats || 10}
                      onChange={(e) => setCriteria(prev => ({
                        ...prev,
                        preferences: { 
                          ...prev.preferences, 
                          nombreResultats: parseInt(e.target.value)
                        }
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white text-gray-900"
                    >
                      <option value={5} className="text-gray-900">5 lycées</option>
                      <option value={10} className="text-gray-900">10 lycées</option>
                      <option value={15} className="text-gray-900">15 lycées</option>
                      <option value={20} className="text-gray-900">20 lycées</option>
                      <option value={30} className="text-gray-900">30 lycées</option>
                      <option value={50} className="text-gray-900">50 lycées</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Type d'établissement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Type d&apos;établissement
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="typeEtablissement"
                      value="tous"
                      checked={criteria.preferences?.typeEtablissement === 'tous'}
                      onChange={(e) => setCriteria(prev => ({
                        ...prev,
                        preferences: { 
                          ...prev.preferences, 
                          typeEtablissement: e.target.value
                        }
                      }))}
                      className="mr-2 text-blue-600"
                    />
                    <span className="text-sm text-gray-900">Tous</span>
                  </label>
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="typeEtablissement"
                      value="public"
                      checked={criteria.preferences?.typeEtablissement === 'public'}
                      onChange={(e) => setCriteria(prev => ({
                        ...prev,
                        preferences: { 
                          ...prev.preferences, 
                          typeEtablissement: e.target.value
                        }
                      }))}
                      className="mr-2 text-blue-600"
                    />
                    <span className="text-sm text-gray-900">Public</span>
                  </label>
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="typeEtablissement"
                      value="prive"
                      checked={criteria.preferences?.typeEtablissement === 'prive'}
                      onChange={(e) => setCriteria(prev => ({
                        ...prev,
                        preferences: { 
                          ...prev.preferences, 
                          typeEtablissement: e.target.value
                        }
                      }))}
                      className="mr-2 text-blue-600"
                    />
                    <span className="text-sm text-gray-900">Privé</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Bouton de recherche */}
          <div className="mt-12 flex justify-center">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Recherche en cours...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Rechercher des lycées
                </>
              )}
            </button>
          </div>

          {/* Affichage des erreurs */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Affichage des informations d'entreprise si trouvée via SIRET */}
      {entrepriseInfo && (
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-8 py-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🏢</span>
              </div>
              Informations de votre entreprise
            </h3>
            <p className="text-gray-600 mt-1">Données récupérées depuis la base SIRENE</p>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{entrepriseInfo.denominationSociale}</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">🏢</span>
                    <span>SIRET: {entrepriseInfo.siret}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">💼</span>
                    <span>Secteur: {entrepriseInfo.secteurActivite}</span>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Adresse</h5>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">📍</span>
                    <span>{entrepriseInfo.adresse.commune} ({entrepriseInfo.adresse.departement})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">📮</span>
                    <span>{entrepriseInfo.adresse.codePostal}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Affichage des résultats */}
      {results && results.length > 0 && (
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">✓</span>
              </div>
              Résultats de recherche
            </h3>
            <p className="text-gray-600 mt-1">{results.length} lycée(s) trouvé(s)</p>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((match: any, index: number) => {
                const lycee = match.lycee;
                return (
                  <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-semibold text-gray-900 text-lg leading-tight">
                        {lycee.nom_etablissement}
                      </h4>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">📍</span>
                        <span>{lycee.libelle_commune} ({lycee.libelle_departement})</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">🏛️</span>
                        <span className="capitalize">{lycee.statut_public_prive}</span>
                      </div>
                      
                      {match.distance && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">📏</span>
                          <span>{Math.round(match.distance)} km</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Formations (quelques-unes) */}
                    {lycee.formations && lycee.formations.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">Formations disponibles :</p>
                        <div className="flex flex-wrap gap-1">
                          {lycee.formations.slice(0, 2).map((formation: string, idx: number) => (
                            <span key={idx} className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded">
                              {formation.length > 25 ? formation.substring(0, 25) + '...' : formation}
                            </span>
                          ))}
                          {lycee.formations.length > 2 && (
                            <span className="text-xs text-gray-500">+{lycee.formations.length - 2}</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Contact */}
                    {(lycee.telephone || lycee.mail) && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        {lycee.telephone && (
                          <div className="flex items-center gap-2 text-xs mb-1">
                            <span className="text-gray-400">📞</span>
                            <span>{lycee.telephone}</span>
                          </div>
                        )}
                        {lycee.mail && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-400">📧</span>
                            <span className="truncate">{lycee.mail}</span>
                          </div>
                        )}
                        {lycee.web && (
                          <div className="flex items-center gap-2 text-xs mt-1">
                            <span className="text-gray-400">🌐</span>
                            <a href={lycee.web} target="_blank" rel="noopener noreferrer" 
                               className="text-blue-600 hover:text-blue-800 truncate">
                              Site web
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Message si aucun résultat */}
      {results && results.length === 0 && (
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun lycée trouvé</h3>
          <p className="text-gray-600">Essayez de modifier vos critères de recherche ou d&apos;élargir la zone géographique.</p>
        </div>
      )}
    </div>
  );
};

export default MatchingLycees;

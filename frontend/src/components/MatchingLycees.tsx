import React, { useState } from 'react';
import { MatchingCriteria, MatchingResponse, MatchingResult } from '../types/api';

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
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full px-6 py-8">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎓 Trouvez vos futurs alternants
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez les lycées professionnels qui correspondent à votre secteur d'activité
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            🔍 Critères de recherche
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Colonne 1: Entreprise */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Votre entreprise</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Saisissez le SIRET de votre entreprise"
                    />
                    {criteria.entreprise?.siret && criteria.entreprise.siret.length === 14 && (
                      <div className="mt-2">
                        <button
                          onClick={handleSearch}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          🔍 Récupérer les données INSEE
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    💡 <strong>SIRETs de démonstration :</strong><br />
                    • 78467169500015 (Informatique - Paris)<br />
                    • 12345678901234 (Commerce - Meaux)<br />
                    • 98765432109876 (Bâtiment - Torcy)
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Secteur d'activité *
                  </label>
                  <select
                    value={criteria.entreprise?.secteurActivite || ''}
                    onChange={(e) => setCriteria(prev => ({
                      ...prev,
                      entreprise: { ...prev.entreprise, secteurActivite: e.target.value }
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Sélectionnez un secteur</option>
                    <option value="informatique">Informatique et numérique</option>
                    <option value="commerce">Commerce et vente</option>
                    <option value="industrie">Industrie et production</option>
                    <option value="batiment">Bâtiment et travaux publics</option>
                    <option value="restauration">Restauration et hôtellerie</option>
                    <option value="transport">Transport et logistique</option>
                    <option value="sante">Santé et social</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Colonne 2: Localisation */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Localisation</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Commune</label>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Paris"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Département</label>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Paris"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Code postal</label>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="75015"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Préférences de recherche */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-700 mb-4">⚙️ Préférences de recherche</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Distance maximale (km)
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={criteria.preferences?.distanceMax || 50}
                  onChange={(e) => setCriteria(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, distanceMax: parseInt(e.target.value) || 50 }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-1 text-xs text-gray-500">
                  Zone de recherche autour de votre entreprise
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Type d'établissement
                </label>
                <select
                  value={criteria.preferences?.typeEtablissement || 'tous'}
                  onChange={(e) => setCriteria(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, typeEtablissement: e.target.value as any }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="tous">Tous les types</option>
                  <option value="public">Public uniquement</option>
                  <option value="prive">Privé uniquement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Nombre de résultats
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={criteria.preferences?.nombreResultats || 10}
                  onChange={(e) => setCriteria(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, nombreResultats: parseInt(e.target.value) || 10 }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-1 text-xs text-gray-500">
                  Maximum de lycées à afficher
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-4 px-8 rounded-lg transition-colors text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
            >
              {loading ? '🔄 Recherche en cours...' : '🔍 Trouver des lycées'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">❌ {error}</p>
            </div>
          )}
        </div>

        {/* Affichage des résultats */}
        {results && (
          <div className="space-y-6">
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
    </div>
  );
};

// Composant pour afficher une carte de lycée améliorée
const LyceeCard: React.FC<{ match: MatchingResult; rank: number }> = ({ match, rank }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

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

import React, { useState } from 'react';

const LyceePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('metiers');

  const metiers = [
    'Hôtellerie Restauration: Cuisine, Service, Réception',
    'Gestion Relation Client: Commerce, Vente, Accueil, Administration',
    'Mécanique Automobile',
    'Industrie Chaudronnerie: Chaudronniers Soudeurs',
    'Métiers de la sécurité',
    'Métiers du sport'
  ];

  const tabs = [
    { id: 'metiers', label: 'Métiers', active: true },
    { id: 'installations', label: 'Installations', active: false },
    { id: 'portraits', label: 'Portraits', active: false },
    { id: 'actions', label: 'Actions', active: false },
    { id: 'partenaires', label: 'Partenaires', active: false }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec logo gouvernemental */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="text-yellow-500 text-3xl">☀️</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Je valorise mon lycée</h1>
                                 <p className="text-sm text-gray-600">Mon Lycée &gt; Carte d'identité du lycée</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-10 bg-blue-600"></div>
              <div className="w-16 h-10 bg-red-600"></div>
              <span className="text-sm text-gray-500 ml-2">beta.gouv.fr</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white border-2 border-blue-600 rounded-lg p-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Section gauche - Métiers */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Les métiers</h2>
              <ul className="space-y-4">
                {metiers.map((metier, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mt-3 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">{metier}</span>
                  </li>
                ))}
              </ul>

              {/* Dropdown pour métiers du sport */}
              <div className="mt-6">
                <select className="w-64 p-3 border border-gray-300 rounded-md bg-white text-gray-700">
                  <option>Métiers du sport</option>
                  <option>Animation sportive</option>
                  <option>Encadrement sportif</option>
                  <option>Gestion d'équipements sportifs</option>
                </select>
              </div>
            </div>

            {/* Section droite - Informations du lycée */}
            <div className="space-y-8">
              {/* Adresse */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Adresse</h3>
                <div className="text-gray-700">
                  <p className="font-medium">Lycée Henri Senez</p>
                  <p>553 rue Fernand Darchicourt</p>
                  <p>62 110 HENIN-BEAUMONT</p>
                </div>
              </div>

              {/* Site web */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Site web</h3>
                <input
                  type="text"
                  value="www.lyceesenez.fr"
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                />
              </div>

              {/* Logo lycée */}
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 font-medium">LOGO LYCÉE</p>
              </div>
            </div>
          </div>

          {/* Chiffres clés */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-8">Chiffres clés (2023-2024)</h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">1200 élèves</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">400 apprentis</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">200 adultes formation continue</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">400 entreprises partenaires</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">+2400 stages à l'année</div>
              </div>
            </div>

            <div className="text-center mt-8">
              <div className="text-2xl font-bold text-gray-900 mb-2">90% de satisfaction des entreprises accueillantes</div>
            </div>
          </div>
        </div>

        {/* Footer avec date */}
        <div className="flex justify-between items-center mt-8 text-sm text-gray-500">
          <span>Mai 2024</span>
          <span>75</span>
        </div>
      </div>
    </div>
  );
};

export default LyceePage; 
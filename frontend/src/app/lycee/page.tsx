'use client';

import React, { useState } from 'react';

const LyceePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('metiers');

  const lyceeData = {
    nom: "Lycée Henri Senez",
    ville: "Hénin-Beaumont",
    secteur: "Public",
    academie: "Lille",
    stats: {
      eleves: 1200,
      apprentis: 400,
      enseignants: 85,
      formations: 12
    }
  };

  const tabs = [
    { id: 'metiers', label: 'Nos métiers', icon: '🔧' },
    { id: 'installations', label: 'Nos installations', icon: '🏢' },
    { id: 'portraits', label: 'Portraits', icon: '👥' },
    { id: 'actions', label: 'Nos actions', icon: '⚡' },
    { id: 'partenaires', label: 'Nos partenaires', icon: '🤝' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'metiers':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Nos formations et métiers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { nom: "Maintenance industrielle", niveau: "Bac Pro", apprentis: 45 },
                { nom: "Électrotechnique", niveau: "Bac Pro", apprentis: 38 },
                { nom: "Chaudronnerie", niveau: "CAP/Bac Pro", apprentis: 52 },
                { nom: "Soudage", niveau: "CAP", apprentis: 28 },
                { nom: "Usinage", niveau: "Bac Pro", apprentis: 41 },
                { nom: "Automatismes", niveau: "BTS", apprentis: 32 }
              ].map((formation, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900">{formation.nom}</h4>
                  <p className="text-sm text-gray-600">{formation.niveau}</p>
                  <p className="text-xs text-blue-600 mt-2">{formation.apprentis} apprentis</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'installations':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Nos équipements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { nom: "Atelier de maintenance", surface: "500m²", equipements: "Machines industrielles, bancs d'essai" },
                { nom: "Laboratoire d'électrotechnique", surface: "200m²", equipements: "Automates, variateurs" },
                { nom: "Atelier de chaudronnerie", surface: "800m²", equipements: "Postes de soudage, plieuses" },
                { nom: "Centre de ressources", surface: "150m²", equipements: "Documentation technique" }
              ].map((installation, index) => (
                <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">{installation.nom}</h4>
                  <p className="text-sm text-gray-600 mb-1">Surface: {installation.surface}</p>
                  <p className="text-sm text-gray-600">{installation.equipements}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'portraits':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Témoignages</h3>
            <div className="space-y-4">
              {[
                { nom: "Marie D.", poste: "Technicienne maintenance", entreprise: "APERAM", temoignage: "L'alternance m'a permis d'acquérir une expérience précieuse tout en étudiant." },
                { nom: "Thomas L.", poste: "Électrotechnicien", entreprise: "ENGIE", temoignage: "Les formateurs nous préparent vraiment bien au monde professionnel." }
              ].map((portrait, index) => (
                <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">{portrait.nom.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{portrait.nom}</h4>
                      <p className="text-sm text-gray-600">{portrait.poste} chez {portrait.entreprise}</p>
                      <p className="text-sm text-gray-800 mt-2 italic">&quot;{portrait.temoignage}&quot;</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'actions':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Nos projets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { titre: "Semaine de l'industrie", description: "Découverte des métiers industriels" },
                { titre: "Projet robotique", description: "Conception d'un robot autonome" },
                { titre: "Partenariat entreprises", description: "Visites et stages en entreprise" },
                { titre: "Formation continue", description: "Sessions pour les professionnels" }
              ].map((action, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900">{action.titre}</h4>
                  <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'partenaires':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Nos partenaires entreprises</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                "APERAM", "ENGIE", "TOTAL", "ARCELOR MITTAL",
                "VEOLIA", "SUEZ", "BOUYGUES", "VINCI"
              ].map((partenaire, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                  <p className="font-medium text-gray-900 text-sm">{partenaire}</p>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header gouvernemental */}
      <div className="bg-white border-b border-gray-200">
        <div className="bg-blue-900 text-white py-1">
          <div className="container mx-auto px-4 flex justify-between items-center text-xs">
            <div className="flex items-center space-x-4">
              <span>🇫🇷 République Française</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>☀️</span>
              <span>🇫🇷</span>
              <span>🇪🇺</span>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">☀️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Je valorise mon lycée</h1>
                <p className="text-sm text-gray-600">Académie de Lille</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        {/* En-tête du lycée */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{lyceeData.nom}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1">
                  📍 {lyceeData.ville}
                </span>
                <span className="flex items-center gap-1">
                  🏛️ {lyceeData.secteur}
                </span>
                <span className="flex items-center gap-1">
                  🎓 Académie de {lyceeData.academie}
                </span>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{lyceeData.stats.eleves}</div>
              <div className="text-sm text-gray-600">Élèves</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{lyceeData.stats.apprentis}</div>
              <div className="text-sm text-gray-600">Apprentis</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{lyceeData.stats.enseignants}</div>
              <div className="text-sm text-gray-600">Enseignants</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{lyceeData.stats.formations}</div>
              <div className="text-sm text-gray-600">Formations</div>
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-4 text-center font-medium text-sm transition-colors duration-200 border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="block">{tab.icon}</span>
                  <span className="block mt-1">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Contenu des onglets */}
          <div className="p-8">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LyceePage; 
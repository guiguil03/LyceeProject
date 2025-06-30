'use client';

import React from 'react';
import MatchingLycees from '@/components/MatchingLycees';

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* En-tête de la section de recherche */}
          <div className="bg-gray-50 px-8 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Outils de recherche
                </h3>
                <p className="text-gray-600 mt-1">
                  Personnalisez votre recherche selon vos préférences
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Données officielles du ministère</span>
              </div>
            </div>
          </div>

          {/* Composant de recherche */}
          <div className="p-8">
            <MatchingLycees />
          </div>
        </div>

        {/* Section d'aide */}
        <div className="mt-12 bg-blue-50 rounded-xl p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Besoin d&apos;aide pour votre recherche ?
            </h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Consultez notre guide d&apos;utilisation ou contactez notre service d&apos;assistance 
              pour obtenir de l&apos;aide dans votre recherche d&apos;orientation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border border-gray-200 transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Guide d&apos;utilisation
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Contacter l&apos;assistance
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 
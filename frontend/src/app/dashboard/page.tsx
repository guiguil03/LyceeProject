'use client';

import React, { useState, useEffect } from 'react';
import api from '@/services/api';

interface Stats {
  total: number;
  en_attente: number;
  en_cours: number;
  traite: number;
  annule: number;
  par_mois: Array<{
    mois: string;
    count: number;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await api.getDemandeStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      setError('Erreur lors du chargement des statistiques');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getPercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  return (
    <div className="fr-container fr-py-6w">
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12">
          <h1 className="fr-h1 fr-mb-4w">
            <span className="fr-icon-line-chart-line fr-mr-2w" aria-hidden="true"></span>
            Tableau de bord
          </h1>
          <p className="fr-text--lead fr-mb-6w">
            Vue d'ensemble des demandes de partenariat et de l'activité de la plateforme
          </p>

          {error && (
            <div className="fr-alert fr-alert--error fr-mb-4w">
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <div className="fr-text--center fr-py-12w">
              <div className="fr-loader" title="Chargement des statistiques...">
                Chargement...
              </div>
            </div>
          ) : stats ? (
            <>
              {/* Cartes de statistiques principales */}
              <div className="fr-grid-row fr-grid-row--gutters fr-mb-6w">
                <div className="fr-col-12 fr-col-sm-6 fr-col-lg-3">
                  <div className="fr-card fr-card--no-border fr-card--shadow">
                    <div className="fr-card__body">
                      <div className="fr-card__content">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="fr-card__title">Total demandes</h3>
                            <p className="fr-text--xl fr-text--bold fr-text--blue-france">
                              {stats.total}
                            </p>
                          </div>
                          <div className="fr-icon-file-text-line fr-text--xl fr-text--blue-france" aria-hidden="true"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="fr-col-12 fr-col-sm-6 fr-col-lg-3">
                  <div className="fr-card fr-card--no-border fr-card--shadow">
                    <div className="fr-card__body">
                      <div className="fr-card__content">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="fr-card__title">En attente</h3>
                            <p className="fr-text--xl fr-text--bold fr-text--orange-terre-battue">
                              {stats.en_attente}
                            </p>
                            <p className="fr-text--sm text-gray-600">
                              {getPercentage(stats.en_attente, stats.total)}%
                            </p>
                          </div>
                          <div className="fr-icon-time-line fr-text--xl fr-text--orange-terre-battue" aria-hidden="true"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="fr-col-12 fr-col-sm-6 fr-col-lg-3">
                  <div className="fr-card fr-card--no-border fr-card--shadow">
                    <div className="fr-card__body">
                      <div className="fr-card__content">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="fr-card__title">En cours</h3>
                            <p className="fr-text--xl fr-text--bold fr-text--info">
                              {stats.en_cours}
                            </p>
                            <p className="fr-text--sm text-gray-600">
                              {getPercentage(stats.en_cours, stats.total)}%
                            </p>
                          </div>
                          <div className="fr-icon-loader-line fr-text--xl fr-text--info" aria-hidden="true"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="fr-col-12 fr-col-sm-6 fr-col-lg-3">
                  <div className="fr-card fr-card--no-border fr-card--shadow">
                    <div className="fr-card__body">
                      <div className="fr-card__content">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="fr-card__title">Traitées</h3>
                            <p className="fr-text--xl fr-text--bold fr-text--success">
                              {stats.traite}
                            </p>
                            <p className="fr-text--sm text-gray-600">
                              {getPercentage(stats.traite, stats.total)}%
                            </p>
                          </div>
                          <div className="fr-icon-check-line fr-text--xl fr-text--success" aria-hidden="true"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Graphique des demandes par mois */}
              <div className="fr-grid-row fr-grid-row--gutters">
                <div className="fr-col-12 fr-col-lg-8">
                  <div className="fr-card fr-card--no-border fr-card--shadow">
                    <div className="fr-card__body">
                      <div className="fr-card__content">
                        <h3 className="fr-card__title fr-mb-4w">
                          Évolution des demandes (12 derniers mois)
                        </h3>
                        
                        {stats.par_mois.length > 0 ? (
                          <div className="space-y-4">
                            {stats.par_mois.map((item, index) => (
                              <div key={item.mois} className="flex items-center justify-between py-2">
                                <div className="flex items-center space-x-4">
                                  <span className="fr-text--sm fr-text--bold min-w-[80px]">
                                    {new Date(item.mois + '-01').toLocaleDateString('fr-FR', { 
                                      year: 'numeric', 
                                      month: 'long' 
                                    })}
                                  </span>
                                  <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[200px]">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                      style={{ 
                                        width: `${Math.max((item.count / Math.max(...stats.par_mois.map(m => m.count))) * 100, 2)}%` 
                                      }}
                                    ></div>
                                  </div>
                                </div>
                                <span className="fr-badge fr-badge--blue-ecume">
                                  {item.count}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="fr-text--center fr-py-6w text-gray-500">
                            Aucune donnée disponible
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Répartition par statut */}
                <div className="fr-col-12 fr-col-lg-4">
                  <div className="fr-card fr-card--no-border fr-card--shadow">
                    <div className="fr-card__body">
                      <div className="fr-card__content">
                        <h3 className="fr-card__title fr-mb-4w">
                          Répartition par statut
                        </h3>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                              <span className="fr-text--sm">En attente</span>
                            </div>
                            <span className="fr-text--sm fr-text--bold">
                              {stats.en_attente} ({getPercentage(stats.en_attente, stats.total)}%)
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span className="fr-text--sm">En cours</span>
                            </div>
                            <span className="fr-text--sm fr-text--bold">
                              {stats.en_cours} ({getPercentage(stats.en_cours, stats.total)}%)
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="fr-text--sm">Traitées</span>
                            </div>
                            <span className="fr-text--sm fr-text--bold">
                              {stats.traite} ({getPercentage(stats.traite, stats.total)}%)
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <span className="fr-text--sm">Annulées</span>
                            </div>
                            <span className="fr-text--sm fr-text--bold">
                              {stats.annule} ({getPercentage(stats.annule, stats.total)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="fr-grid-row fr-grid-row--gutters fr-mt-6w">
                <div className="fr-col-12">
                  <div className="fr-card fr-card--no-border">
                    <div className="fr-card__body">
                      <div className="fr-card__content">
                        <h3 className="fr-card__title fr-mb-4w">Actions rapides</h3>
                        <div className="fr-btns-group">
                          <button 
                            className="fr-btn fr-btn--icon-left fr-icon-add-line"
                            onClick={() => window.location.href = '/demandes'}
                          >
                            Nouvelle demande
                          </button>
                          <button 
                            className="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-refresh-line"
                            onClick={loadStats}
                          >
                            Actualiser les données
                          </button>
                          <button 
                            className="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-search-line"
                            onClick={() => window.location.href = '/search'}
                          >
                            Rechercher des lycées
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="fr-text--center fr-py-12w">
              <p className="fr-text--lead text-gray-500">
                Aucune statistique disponible
              </p>
              <button 
                className="fr-btn fr-btn--secondary fr-mt-4w"
                onClick={loadStats}
              >
                Charger les données
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

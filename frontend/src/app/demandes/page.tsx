'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api, { Demande, CreateDemandeRequest } from '@/services/api';

interface LyceeProfessionnel {
  numero_uai: string;
  nom_etablissement: string;
  type_etablissement: string;
  libelle_commune: string;
  libelle_departement: string;
  formations: string[];
}

interface ExtendedDemande extends Demande {
  lycee_nom?: string;
  priorite?: string;
}

export default function DemandesPage() {
  const { user, isLoading } = useAuth();
  const [demandes, setDemandes] = useState<ExtendedDemande[]>([]);
  const [lycees, setLycees] = useState<LyceeProfessionnel[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchLycee, setSearchLycee] = useState('');
  const [filteredLycees, setFilteredLycees] = useState<LyceeProfessionnel[]>([]);
  const [filter, setFilter] = useState({ statut: '', type: '', priorite: '' });

  // Formulaire de création
  const [formData, setFormData] = useState<CreateDemandeRequest & { lycee_uai?: string }>({
    entreprise_id: '',
    lycee_uai: '',
    titre: '',
    description: '',
    type_partenariat: 'stage',
    priorite: 'NORMALE'
  });

  // Vérification d'authentification
  useEffect(() => {
    if (!isLoading && (!user || user.type !== 'entreprise')) {
      window.location.href = '/auth';
    }
  }, [user, isLoading]);

  // Charger les demandes et lycées au démarrage
  useEffect(() => {
    if (user?.type === 'entreprise') {
      loadDemandes();
      loadLycees();
      setFormData(prev => ({ ...prev, entreprise_id: user.id }));
    }
  }, [user]);

  // Pré-remplir le lycée si spécifié dans l'URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const lyceeUai = urlParams.get('lycee_uai');
    
    if (lyceeUai) {
      console.log('🎯 Lycée pré-sélectionné via URL:', lyceeUai);
      setShowCreateForm(true);
      setFormData(prev => ({ ...prev, lycee_uai: lyceeUai }));
      
      if (lycees.length > 0) {
        const lycee = lycees.find(l => l.numero_uai === lyceeUai);
        if (lycee) {
          setSearchLycee(`${lycee.nom_etablissement} - ${lycee.libelle_commune}`);
        }
      }
    }
  }, [lycees]);

  // Filtrer les lycées selon la recherche
  useEffect(() => {
    if (searchLycee.trim() === '') {
      setFilteredLycees(lycees.slice(0, 10));
    } else {
      const filtered = lycees.filter(lycee =>
        lycee.nom_etablissement.toLowerCase().includes(searchLycee.toLowerCase()) ||
        lycee.libelle_commune.toLowerCase().includes(searchLycee.toLowerCase()) ||
        lycee.libelle_departement.toLowerCase().includes(searchLycee.toLowerCase())
      ).slice(0, 10);
      setFilteredLycees(filtered);
    }
  }, [searchLycee, lycees]);

  const loadDemandes = async () => {
    setLoading(true);
    try {
      const response = await api.getDemandes();
      if (response.success) {
        setDemandes(response.data);
      }
    } catch (error) {
      setError('Erreur lors du chargement des demandes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadLycees = async () => {
    try {
      console.log('🔍 Chargement des vrais lycées professionnels...');
      const lycees = await api.searchLyceesReels();
      console.log('📚 Lycées chargés:', lycees.length);
      setLycees(lycees);
    } catch (error) {
      console.error('Erreur lors du chargement des lycées:', error);
      setError('Impossible de charger la liste des lycées. Veuillez réessayer.');
    }
  };

  const handleCreateDemande = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.titre || !formData.description || !formData.lycee_uai) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const response = await api.createDemande(formData);
      if (response.success) {
        setSuccess('Demande envoyée avec succès au lycée !');
        setShowCreateForm(false);
        setFormData({
          entreprise_id: user?.id || '',
          lycee_uai: '',
          titre: '',
          description: '',
          type_partenariat: 'stage',
          priorite: 'NORMALE'
        });
        setSearchLycee('');
        loadDemandes();
      }
    } catch (error) {
      setError('Erreur lors de l&apos;envoi de la demande');
      console.error(error);
    }
  };

  const selectLycee = (lycee: LyceeProfessionnel) => {
    setFormData({ ...formData, lycee_uai: lycee.numero_uai });
    setSearchLycee(`${lycee.nom_etablissement} - ${lycee.libelle_commune}`);
    setFilteredLycees([]);
  };

  const getStatusBadge = (statut: string) => {
    const badges: Record<string, string> = {
      'en_attente': 'fr-badge fr-badge--warning',
      'en_cours': 'fr-badge fr-badge--info',
      'acceptee': 'fr-badge fr-badge--success',
      'refusee': 'fr-badge fr-badge--error'
    };
    return badges[statut] || 'fr-badge fr-badge--warning';
  };

  const getStatusLabel = (statut: string) => {
    const labels: Record<string, string> = {
      'en_attente': 'En attente',
      'en_cours': 'En cours',
      'acceptee': 'Acceptée',
      'refusee': 'Refusée'
    };
    return labels[statut] || 'En attente';
  };

  const getPriorityBadge = (priorite: string) => {
    const badges: Record<string, string> = {
      'BASSE': 'fr-badge fr-badge--grey',
      'NORMALE': 'fr-badge fr-badge--blue-ecume',
      'HAUTE': 'fr-badge fr-badge--orange-terre-battue',
      'URGENTE': 'fr-badge fr-badge--error'
    };
    return badges[priorite] || 'fr-badge fr-badge--blue-ecume';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'stage': 'Stages',
      'alternance': 'Alternance',
      'visite_entreprise': 'Visite',
      'conference': 'Conférence',
      'projet_collaboratif': 'Projet',
      'recrutement': 'Recrutement',
      'autre': 'Autre'
    };
    return labels[type] || type;
  };

  const getPriorityLabel = (priorite: string) => {
    const labels: Record<string, string> = {
      'BASSE': 'Basse',
      'NORMALE': 'Normale',
      'HAUTE': 'Haute',
      'URGENTE': 'Urgente'
    };
    return labels[priorite] || 'Normale';
  };

  const getFilteredDemandes = () => {
    return demandes.filter(demande => {
      return (
        (!filter.statut || demande.statut === filter.statut) &&
        (!filter.type || demande.type_partenariat === filter.type) &&
        (!filter.priorite || demande.priorite === filter.priorite)
      );
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Vérifier si la date est valide et pas dans le futur
    const now = new Date();
    if (date > now) {
      // Si la date est dans le futur, utiliser la date actuelle
      return now.toLocaleDateString('fr-FR');
    }
    return date.toLocaleDateString('fr-FR');
  };

  if (isLoading) {
    return (
      <div className="fr-container fr-py-4w">
        <div className="fr-text--center">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  const filteredDemandes = getFilteredDemandes();

  return (
    <div className="fr-container-fluid fr-py-4w">
      <div className="fr-container">
        {/* En-tête */}
        <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--middle fr-mb-6w">
          <div className="fr-col-12 fr-col-md-8">
            <h1 className="fr-h1 fr-mb-2w">
              <span className="fr-icon-mail-line fr-mr-2w" aria-hidden="true"></span>
              Mes demandes de partenariat
            </h1>
            <p className="fr-text--lead fr-mb-0">
              Gérez vos demandes de collaboration avec les lycées professionnels
            </p>
          </div>
          <div className="fr-col-12 fr-col-md-4 fr-text--right">
            <button
              className="fr-btn fr-btn--icon-left fr-icon-add-line"
              onClick={() => setShowCreateForm(true)}
            >
              Nouvelle demande
            </button>
          </div>
        </div>

        {/* Messages d'alerte */}
        {error && (
          <div className="fr-alert fr-alert--error fr-mb-4w">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="fr-alert fr-alert--success fr-mb-4w">
            <p>{success}</p>
          </div>
        )}

        {/* Formulaire de création */}
        {showCreateForm && (
          <div className="fr-modal fr-modal--opened" id="modal-create">
            <div className="fr-container fr-container--fluid fr-container-md">
              <div className="fr-grid-row fr-grid-row--center">
                <div className="fr-col-12 fr-col-md-10 fr-col-lg-8">
                  <div className="fr-modal__body">
                    <div className="fr-modal__header">
                      <button
                        className="fr-btn--close fr-btn"
                        title="Fermer"
                        onClick={() => setShowCreateForm(false)}
                      >
                        Fermer
                      </button>
                    </div>
                    <div className="fr-modal__content">
                      <h2 className="fr-modal__title">
                        <span className="fr-icon-add-circle-line fr-mr-2w" aria-hidden="true"></span>
                        Nouvelle demande de partenariat
                      </h2>
                      
                      <form onSubmit={handleCreateDemande}>
                        <div className="fr-grid-row fr-grid-row--gutters">
                          {/* Recherche de lycée */}
                          <div className="fr-col-12">
                            <div className="fr-input-group">
                              <label className="fr-label" htmlFor="lycee_search">
                                <i className="ri-search-line fr-mr-1w"></i>
                                Rechercher un lycée *
                              </label>
                              <input
                                className="fr-input"
                                type="text"
                                id="lycee_search"
                                value={searchLycee}
                                onChange={(e) => setSearchLycee(e.target.value)}
                                placeholder="Nom du lycée, ville ou département..."
                                required
                              />
                              <div className="fr-hint-text fr-mt-1w">
                                💡 Tapez pour rechercher parmi {lycees.length} lycées professionnels
                              </div>
                            </div>

                            {/* Résultats de recherche */}
                            {filteredLycees.length > 0 && searchLycee && !formData.lycee_uai && (
                              <div className="fr-mt-2w">
                                <div className="fr-card fr-card--shadow">
                                  <div className="fr-card__body">
                                    <h4 className="fr-h6">Lycées trouvés :</h4>
                                    {filteredLycees.map((lycee) => (
                                      <button
                                        key={lycee.numero_uai}
                                        type="button"
                                        className="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-mb-1w fr-mr-1w"
                                        onClick={() => selectLycee(lycee)}
                                      >
                                        <strong>{lycee.nom_etablissement}</strong><br/>
                                        <small>{lycee.libelle_commune} ({lycee.libelle_departement})</small>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Type de partenariat */}
                          <div className="fr-col-12 fr-col-md-6">
                            <div className="fr-select-group">
                              <label className="fr-label" htmlFor="type_partenariat">
                                <i className="ri-handshake-line fr-mr-1w"></i>
                                Type de partenariat *
                              </label>
                              <select
                                className="fr-select"
                                id="type_partenariat"
                                value={formData.type_partenariat}
                                onChange={(e) => setFormData({...formData, type_partenariat: e.target.value})}
                                required
                              >
                                <option value="stage">Proposition de stages</option>
                                <option value="alternance">Offres d&apos;alternance</option>
                                <option value="visite_entreprise">Visite de notre entreprise</option>
                                <option value="conference">Conférence métier</option>
                                <option value="projet_collaboratif">Projet collaboratif</option>
                                <option value="recrutement">Recrutement futur</option>
                                <option value="autre">Autre collaboration</option>
                              </select>
                            </div>
                          </div>

                          {/* Priorité */}
                          <div className="fr-col-12 fr-col-md-6">
                            <div className="fr-select-group">
                              <label className="fr-label" htmlFor="priorite">
                                <i className="ri-flag-line fr-mr-1w"></i>
                                Priorité
                              </label>
                              <select
                                className="fr-select"
                                id="priorite"
                                value={formData.priorite}
                                onChange={(e) => setFormData({...formData, priorite: e.target.value as 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE'})}
                              >
                                <option value="BASSE">Basse - Simple prise de contact</option>
                                <option value="NORMALE">Normale - Projet à moyen terme</option>
                                <option value="HAUTE">Haute - Besoin urgent</option>
                                <option value="URGENTE">Urgente - Réponse souhaitée rapidement</option>
                              </select>
                            </div>
                          </div>

                          {/* Objet */}
                          <div className="fr-col-12">
                            <div className="fr-input-group">
                              <label className="fr-label" htmlFor="titre">
                                <i className="ri-text fr-mr-1w"></i>
                                Objet du message *
                              </label>
                              <input
                                className="fr-input"
                                type="text"
                                id="titre"
                                value={formData.titre}
                                onChange={(e) => setFormData({...formData, titre: e.target.value})}
                                placeholder="Ex: Partenariat pour stages en développement web"
                                required
                              />
                            </div>
                          </div>

                          {/* Message */}
                          <div className="fr-col-12">
                            <div className="fr-input-group">
                              <label className="fr-label" htmlFor="description">
                                <i className="ri-message-3-line fr-mr-1w"></i>
                                Votre message *
                              </label>
                              <textarea
                                className="fr-input"
                                id="description"
                                rows={6}
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder="Présentez votre entreprise, vos besoins et ce que vous pouvez apporter aux élèves..."
                                required
                              />
                              <div className="fr-hint-text fr-mt-1w">
                                💡 <strong>Conseils :</strong> Mentionnez votre secteur d&apos;activité, vos besoins en compétences, 
                                et les opportunités que vous offrez (stages, emplois, projets).
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Boutons */}
                        <div className="fr-btns-group fr-btns-group--right fr-mt-4w">
                          <button
                            type="button"
                            className="fr-btn fr-btn--secondary"
                            onClick={() => setShowCreateForm(false)}
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            className="fr-btn"
                            disabled={!formData.lycee_uai || !formData.titre || !formData.description}
                          >
                            Envoyer la demande
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="fr-card fr-mb-4w">
          <div className="fr-card__body">
            <div className="fr-card__content">
              <h3 className="fr-card__title">
                <span className="fr-icon-filter-line fr-mr-2w" aria-hidden="true"></span>
                Filtrer mes demandes
              </h3>
              
              <div className="fr-grid-row fr-grid-row--gutters">
                <div className="fr-col-12 fr-col-md-4">
                  <div className="fr-select-group">
                    <label className="fr-label" htmlFor="filter-statut">Statut</label>
                    <select
                      className="fr-select"
                      id="filter-statut"
                      value={filter.statut}
                      onChange={(e) => setFilter({...filter, statut: e.target.value})}
                    >
                      <option value="">Tous les statuts</option>
                      <option value="en_attente">En attente</option>
                      <option value="en_cours">En cours</option>
                      <option value="acceptee">Acceptée</option>
                      <option value="refusee">Refusée</option>
                    </select>
                  </div>
                </div>
                
                <div className="fr-col-12 fr-col-md-4">
                  <div className="fr-select-group">
                    <label className="fr-label" htmlFor="filter-type">Type</label>
                    <select
                      className="fr-select"
                      id="filter-type"
                      value={filter.type}
                      onChange={(e) => setFilter({...filter, type: e.target.value})}
                    >
                      <option value="">Tous les types</option>
                      <option value="stage">Stages</option>
                      <option value="alternance">Alternance</option>
                      <option value="visite_entreprise">Visite</option>
                      <option value="conference">Conférence</option>
                      <option value="projet_collaboratif">Projet</option>
                      <option value="recrutement">Recrutement</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>
                
                <div className="fr-col-12 fr-col-md-4">
                  <div className="fr-select-group">
                    <label className="fr-label" htmlFor="filter-priorite">Priorité</label>
                    <select
                      className="fr-select"
                      id="filter-priorite"
                      value={filter.priorite}
                      onChange={(e) => setFilter({...filter, priorite: e.target.value})}
                    >
                      <option value="">Toutes les priorités</option>
                      <option value="BASSE">Basse</option>
                      <option value="NORMALE">Normale</option>
                      <option value="HAUTE">Haute</option>
                      <option value="URGENTE">Urgente</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des demandes */}
        <div className="fr-card">
          <div className="fr-card__body">
            <div className="fr-card__content">
              <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--middle fr-mb-4w">
                <div className="fr-col-12 fr-col-md-8">
                  <h2 className="fr-card__title fr-mb-0">
                    Mes demandes envoyées
                    {filteredDemandes.length > 0 && (
                      <span className="fr-text--sm fr-text--color-grey fr-ml-2w">
                        ({filteredDemandes.length} demande{filteredDemandes.length > 1 ? 's' : ''})
                      </span>
                    )}
                  </h2>
                </div>
                <div className="fr-col-12 fr-col-md-4 fr-text--right">
                  {demandes.length > 0 && (
                    <button
                      className="fr-btn fr-btn--tertiary fr-btn--sm fr-btn--icon-left fr-icon-refresh-line"
                      onClick={loadDemandes}
                      disabled={loading}
                    >
                      Actualiser
                    </button>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="fr-text--center fr-py-6w">
                  <span className="fr-icon-refresh-line fr-icon--lg" aria-hidden="true"></span>
                  <p className="fr-mt-2w">Chargement des demandes...</p>
                </div>
              ) : filteredDemandes.length === 0 ? (
                <div className="fr-text--center fr-py-8w">
                  <span className="fr-icon-mail-line fr-icon--xl" aria-hidden="true"></span>
                  <h3 className="fr-h5 fr-mt-4w">
                    {demandes.length === 0 ? 'Aucune demande envoyée' : 'Aucune demande ne correspond aux filtres'}
                  </h3>
                  <p className="fr-mb-4w">
                    {demandes.length === 0 
                      ? 'Commencez par créer votre première demande pour contacter un lycée !'
                      : 'Modifiez vos filtres pour voir plus de demandes.'
                    }
                  </p>
                  {demandes.length === 0 && (
                    <button
                      className="fr-btn fr-btn--icon-left fr-icon-add-line"
                      onClick={() => setShowCreateForm(true)}
                    >
                      Nouvelle demande
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Version Desktop */}
                  <div className="fr-table fr-table--bordered fr-hidden fr-unhidden-lg" style={{ width: '100%' }}>
                    <table style={{ width: '100%', tableLayout: 'fixed' }}>
                      <thead>
                        <tr>
                          <th scope="col" style={{ width: '25%' }}>Lycée</th>
                          <th scope="col" style={{ width: '25%' }}>Objet</th>
                          <th scope="col" style={{ width: '12%' }}>Type</th>
                          <th scope="col" style={{ width: '12%' }}>Statut</th>
                          <th scope="col" style={{ width: '12%' }}>Priorité</th>
                          <th scope="col" style={{ width: '10%' }}>Date</th>
                          <th scope="col" style={{ width: '14%' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDemandes.map((demande) => (
                          <tr key={demande.id}>
                            <td>
                              <strong>{demande.lycee_nom || 'Lycée non spécifié'}</strong>
                            </td>
                            <td>
                              <div style={{ maxWidth: '200px' }}>
                                <span title={demande.titre}>
                                  {demande.titre.length > 50 ? `${demande.titre.substring(0, 50)}...` : demande.titre}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className="fr-badge fr-badge--blue-ecume">
                                {getTypeLabel(demande.type_partenariat || '')}
                              </span>
                            </td>
                            <td>
                              <span className={getStatusBadge(demande.statut)}>
                                {getStatusLabel(demande.statut)}
                              </span>
                            </td>
                            <td>
                              <span className={getPriorityBadge(demande.priorite || 'NORMALE')}>
                                {getPriorityLabel(demande.priorite || 'NORMALE')}
                              </span>
                            </td>
                            <td>
                              <time dateTime={demande.date_creation}>
                                {formatDate(demande.date_creation)}
                              </time>
                            </td>
                            <td>
                              <div className="fr-btns-group fr-btns-group--sm">
                                <button 
                                  className="fr-btn fr-btn--tertiary fr-btn--sm fr-btn--icon-left fr-icon-eye-line"
                                  title="Voir les détails"
                                >
                                  Détails
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Version Mobile */}
                  <div className="fr-hidden-lg">
                    {filteredDemandes.map((demande) => (
                      <div key={demande.id} className="fr-card fr-card--shadow fr-mb-3w">
                        <div className="fr-card__body">
                          <div className="fr-card__content">
                            <div className="fr-grid-row fr-grid-row--gutters">
                              <div className="fr-col-12">
                                <h4 className="fr-card__title fr-mb-2w">
                                  {demande.lycee_nom || 'Lycée non spécifié'}
                                </h4>
                              </div>
                              
                              <div className="fr-col-6">
                                <p className="fr-text--sm fr-mb-1w">
                                  <strong>Objet :</strong><br/>
                                  {demande.titre}
                                </p>
                              </div>
                              
                              <div className="fr-col-6">
                                <p className="fr-text--sm fr-mb-1w">
                                  <strong>Date :</strong><br/>
                                  {formatDate(demande.date_creation)}
                                </p>
                              </div>
                              
                              <div className="fr-col-12 fr-mt-2w">
                                <div className="fr-badges-group">
                                  <span className="fr-badge fr-badge--blue-ecume">
                                    {getTypeLabel(demande.type_partenariat || '')}
                                  </span>
                                  <span className={getStatusBadge(demande.statut)}>
                                    {getStatusLabel(demande.statut)}
                                  </span>
                                  <span className={getPriorityBadge(demande.priorite || 'NORMALE')}>
                                    {getPriorityLabel(demande.priorite || 'NORMALE')}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="fr-col-12 fr-mt-3w">
                                <button 
                                  className="fr-btn fr-btn--tertiary fr-btn--sm fr-btn--icon-left fr-icon-eye-line"
                                  title="Voir les détails"
                                >
                                  Voir les détails
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

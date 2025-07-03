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

  // Filtrer les lycées selon la recherche
  useEffect(() => {
    if (searchLycee.trim() === '') {
      setFilteredLycees(lycees.slice(0, 10)); // Limiter à 10 pour les performances
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
      // Utiliser l'API backend qui retourne les vraies données de l'API Education.gouv.fr
      const lycees = await api.searchLyceesReels();
      console.log('📚 Lycées chargés:', lycees.length);
      setLycees(lycees);
    } catch (error) {
      console.error('Erreur lors du chargement des lycées:', error);
      // En cas d'erreur, afficher un message à l'utilisateur
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
        loadDemandes(); // Recharger la liste
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
    return badges[statut] || 'fr-badge';
  };

  const getStatusLabel = (statut: string) => {
    const labels: Record<string, string> = {
      'en_attente': 'En attente',
      'en_cours': 'En cours',
      'acceptee': 'Acceptée',
      'refusee': 'Refusée'
    };
    return labels[statut] || statut;
  };

  const getPriorityBadge = (priorite: string) => {
    const badges: Record<string, string> = {
      'BASSE': 'fr-badge fr-badge--grey',
      'NORMALE': 'fr-badge fr-badge--blue-ecume',
      'HAUTE': 'fr-badge fr-badge--orange-terre-battue',
      'URGENTE': 'fr-badge fr-badge--error'
    };
    return badges[priorite] || 'fr-badge';
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

  const getStatusIcon = (statut: string) => {
    const icons: Record<string, string> = {
      'en_attente': 'ri-time-line',
      'en_cours': 'ri-refresh-line',
      'acceptee': 'ri-check-line',
      'refusee': 'ri-close-line'
    };
    return icons[statut] || 'ri-question-line';
  };

  const getPriorityIcon = (priorite: string) => {
    const icons: Record<string, string> = {
      'BASSE': 'ri-arrow-down-line',
      'NORMALE': 'ri-subtract-line',
      'HAUTE': 'ri-arrow-up-line',
      'URGENTE': 'ri-alarm-warning-line'
    };
    return icons[priorite] || 'ri-subtract-line';
  };

  const getPriorityLabel = (priorite: string) => {
    const labels: Record<string, string> = {
      'BASSE': 'Basse',
      'NORMALE': 'Normale',
      'HAUTE': 'Haute',
      'URGENTE': 'Urgente'
    };
    return labels[priorite] || priorite;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Il y a moins d&apos;1h';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    }
  };

  if (isLoading) {
    return (
      <div className="fr-container fr-py-6w">
        <div className="fr-grid-row fr-grid-row--center">
          <div className="fr-col-12 fr-col-md-6">
            <div className="fr-card">
              <div className="fr-card__body">
                <div className="fr-card__content">
                  <p className="fr-text--center">Chargement...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.type !== 'entreprise') {
    return null;
  }

  return (
    <div className="fr-container fr-py-6w">
      {/* En-tête */}
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12">
          <div className="fr-mb-4w">
            <h1 className="fr-h1">
              <i className="ri-mail-send-line fr-mr-2w"></i>
              Contacter les lycées
            </h1>
            <p className="fr-text--lead">
              Exprimez votre intérêt pour des partenariats avec les lycées professionnels
            </p>
          </div>

          {/* Messages d'erreur/succès */}
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

          {/* Actions */}
          <div className="fr-btns-group fr-mb-6w">
            <button
              className="fr-btn fr-btn--icon-left ri-add-line"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? 'Annuler' : 'Nouvelle demande'}
            </button>
            <button
              className="fr-btn fr-btn--secondary fr-btn--icon-left ri-refresh-line"
              onClick={loadDemandes}
              disabled={loading}
            >
              Actualiser
            </button>
          </div>

          {/* Formulaire de création */}
          {showCreateForm && (
            <div className="fr-card fr-card--shadow fr-mb-6w" style={{ border: '2px solid #000091' }}>
              <div className="fr-card__body">
                <div className="fr-card__content">
                  <h3 className="fr-card__title">
                    <i className="ri-mail-send-line fr-mr-2w"></i>
                    Écrire à un lycée
                  </h3>
                  
                  {/* Section d'aide */}
                  <div className="fr-callout fr-callout--info fr-mb-4w">
                    <h4 className="fr-callout__title">
                      <i className="ri-information-line fr-mr-1w"></i>
                      Comment exprimer votre intérêt ?
                    </h4>
                    <p><strong>Recherche de lycée :</strong> Tapez le nom d&apos;un lycée ou d&apos;une ville pour trouver l&apos;établissement qui vous intéresse.</p>
                    <p><strong>Type de partenariat :</strong> Choisissez le type de collaboration que vous souhaitez (stage, alternance, visite, etc.).</p>
                    <p><strong>Message :</strong> Décrivez votre entreprise, vos besoins et ce que vous pouvez apporter aux élèves.</p>
                  </div>
                  
                  <form onSubmit={handleCreateDemande}>
                    <div className="fr-grid-row fr-grid-row--gutters">
                      {/* Recherche de lycée */}
                      <div className="fr-col-12">
                        <div className="fr-search-group">
                          <label className="fr-label" htmlFor="search_lycee">
                            <i className="ri-school-line fr-mr-1w"></i>
                            Lycée destinataire *
                            <span className="fr-hint-text">Recherchez le lycée que vous souhaitez contacter</span>
                          </label>
                          <div className="fr-search-bar">
                            <input
                              className="fr-input"
                              type="text"
                              id="search_lycee"
                              value={searchLycee}
                              onChange={(e) => setSearchLycee(e.target.value)}
                              placeholder="Ex: Lycée Jean Moulin, Lyon, Métallurgie..."
                              required
                            />
                            <button 
                              className="fr-btn fr-btn--icon-only ri-search-line" 
                              type="button"
                              title="Rechercher un lycée"
                            >
                              Rechercher
                            </button>
                          </div>
                          
                          {/* Résultats de recherche */}
                          {filteredLycees.length > 0 && searchLycee && (
                            <div className="fr-card fr-card--no-border fr-mt-2w" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                              <div className="fr-card__body">
                                <h5 className="fr-text--sm fr-mb-2w">Lycées trouvés :</h5>
                                {filteredLycees.map((lycee) => (
                                  <div 
                                    key={lycee.numero_uai}
                                    className="fr-p-2w fr-mb-1w"
                                    style={{ 
                                      border: '1px solid #ddd', 
                                      borderRadius: '4px', 
                                      cursor: 'pointer',
                                      backgroundColor: '#f8f9fa'
                                    }}
                                    onClick={() => selectLycee(lycee)}
                                  >
                                    <strong>{lycee.nom_etablissement}</strong>
                                    <br />
                                    <small className="fr-text--sm">
                                      {lycee.libelle_commune} ({lycee.libelle_departement})
                                    </small>
                                    {lycee.formations.length > 0 && (
                                      <div className="fr-mt-1w">
                                        <small className="fr-text--xs">
                                          Formations : {lycee.formations.slice(0, 3).join(', ')}
                                          {lycee.formations.length > 3 && '...'}
                                        </small>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
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
                        className="fr-btn fr-btn--icon-left ri-send-plane-line"
                        disabled={!formData.lycee_uai || !formData.titre || !formData.description}
                      >
                        Envoyer la demande
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Liste des demandes */}
          <div className="fr-card fr-card--shadow">
            <div className="fr-card__body">
              <div className="fr-card__content">
                <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--middle fr-mb-4w">
                  <div className="fr-col">
                    <h2 className="fr-card__title fr-mb-0">
                      <i className="ri-file-list-3-line fr-mr-2w"></i>
                      Mes demandes envoyées
                    </h2>
                    {demandes.length > 0 && (
                      <p className="fr-text--sm fr-text--color-grey fr-mb-0">
                        {demandes.length} demande{demandes.length > 1 ? 's' : ''} au total
                      </p>
                    )}
                  </div>
                  {demandes.length > 0 && (
                    <div className="fr-col-auto">
                      <div className="fr-btns-group fr-btns-group--sm">
                        <button 
                          className="fr-btn fr-btn--sm fr-btn--tertiary fr-btn--icon-left ri-filter-line"
                          onClick={() => {/* TODO: Ajouter filtres */}}
                        >
                          Filtrer
                        </button>
                        <button 
                          className="fr-btn fr-btn--sm fr-btn--tertiary fr-btn--icon-left ri-download-line"
                          onClick={() => {/* TODO: Ajouter export */}}
                        >
                          Exporter
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {loading ? (
                  <div className="fr-text--center fr-py-4w">
                    <p>Chargement des demandes...</p>
                  </div>
                ) : demandes.length === 0 ? (
                  <div className="fr-card fr-card--no-border" style={{ backgroundColor: '#f6f6f6' }}>
                    <div className="fr-card__body">
                      <div className="fr-card__content fr-text--center fr-py-6w">
                        <div className="fr-mb-4w">
                          <i className="ri-mail-send-line" style={{ fontSize: '4rem', color: '#666', opacity: 0.5 }}></i>
                        </div>
                        <h3 className="fr-h5 fr-mb-2w">Aucune demande envoyée</h3>
                        <p className="fr-text--lg fr-mb-4w fr-text--color-grey">
                          Vous n&apos;avez pas encore contacté de lycées professionnels.
                        </p>
                        <div className="fr-callout fr-callout--blue-ecume fr-callout--sm">
                          <p className="fr-callout__text">
                            <strong>💡 Pour commencer :</strong><br />
                                                         Cliquez sur &quot;Nouvelle demande&quot; pour contacter un lycée et proposer un partenariat !
                          </p>
                        </div>
                        <div className="fr-mt-4w">
                          <button
                            className="fr-btn fr-btn--lg fr-btn--icon-left ri-add-line"
                            onClick={() => setShowCreateForm(true)}
                          >
                            Créer ma première demande
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="fr-table fr-table--bordered">
                    <div className="fr-table__wrapper">
                      <div className="fr-table__container">
                        <div className="fr-table__content">
                          <table>
                            <thead>
                              <tr>
                                <th scope="col" style={{ width: '25%' }}>
                                  <i className="ri-school-line fr-mr-1w"></i>
                                  Lycée destinataire
                                </th>
                                <th scope="col" style={{ width: '25%' }}>
                                  <i className="ri-mail-line fr-mr-1w"></i>
                                  Objet de la demande
                                </th>
                                <th scope="col" style={{ width: '15%' }}>
                                  <i className="ri-handshake-line fr-mr-1w"></i>
                                  Type
                                </th>
                                <th scope="col" style={{ width: '12%' }}>
                                  <i className="ri-pulse-line fr-mr-1w"></i>
                                  Statut
                                </th>
                                <th scope="col" style={{ width: '12%' }}>
                                  <i className="ri-flag-line fr-mr-1w"></i>
                                  Priorité
                                </th>
                                <th scope="col" style={{ width: '11%' }}>
                                  <i className="ri-calendar-line fr-mr-1w"></i>
                                  Date
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {demandes.map((demande) => (
                                <tr key={demande.id}>
                                  <td>
                                    <div className="fr-mb-1w">
                                      <strong className="fr-text--md">
                                        {demande.lycee_nom || 'Lycée non spécifié'}
                                      </strong>
                                    </div>
                                    <small className="fr-text--xs fr-text--color-grey">
                                      <i className="ri-map-pin-line fr-mr-1v"></i>
                                      Contact établi
                                    </small>
                                  </td>
                                  <td>
                                    <div className="fr-text--md fr-mb-1v">
                                      {demande.titre}
                                    </div>
                                    {demande.description && (
                                      <small className="fr-text--xs fr-text--color-grey">
                                        {demande.description.substring(0, 60)}
                                        {demande.description.length > 60 && '...'}
                                      </small>
                                    )}
                                  </td>
                                  <td>
                                    <span className="fr-badge fr-badge--blue-ecume fr-badge--sm">
                                      {getTypeLabel(demande.type_partenariat || '')}
                                    </span>
                                  </td>
                                  <td>
                                    <span className={`${getStatusBadge(demande.statut)} fr-badge--sm`}>
                                      <i className={`${getStatusIcon(demande.statut)} fr-mr-1v`}></i>
                                      {getStatusLabel(demande.statut)}
                                    </span>
                                  </td>
                                  <td>
                                    <span className={`${getPriorityBadge(demande.priorite || 'NORMALE')} fr-badge--sm`}>
                                      <i className={`${getPriorityIcon(demande.priorite || 'NORMALE')} fr-mr-1v`}></i>
                                      {getPriorityLabel(demande.priorite || 'NORMALE')}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="fr-text--sm fr-mb-1v">
                                      {new Date(demande.date_creation).toLocaleDateString('fr-FR')}
                                    </div>
                                    <small className="fr-text--xs fr-text--color-grey">
                                      {getTimeAgo(demande.date_creation)}
                                    </small>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

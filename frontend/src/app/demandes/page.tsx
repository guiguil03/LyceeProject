'use client';

import React, { useState, useEffect } from 'react';
import api, { Demande, CreateDemandeRequest } from '@/services/api';

export default function DemandesPage() {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Formulaire de création
  const [formData, setFormData] = useState<CreateDemandeRequest>({
    entreprise_id: '',
    titre: '',
    description: '',
    type_partenariat: 'stage',
    priorite: 'NORMALE'
  });

  // Charger les demandes au démarrage
  useEffect(() => {
    loadDemandes();
  }, []);

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

  const handleCreateDemande = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.titre || !formData.entreprise_id) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const response = await api.createDemande(formData);
      if (response.success) {
        setSuccess('Demande créée avec succès !');
        setShowCreateForm(false);
        setFormData({
          entreprise_id: '',
          titre: '',
          description: '',
          type_partenariat: 'stage',
          priorite: 'NORMALE'
        });
        loadDemandes(); // Recharger la liste
      }
    } catch (error) {
      setError('Erreur lors de la création de la demande');
      console.error(error);
    }
  };

  const getStatusBadge = (statut: string) => {
    const badges: Record<string, string> = {
      'EN_ATTENTE': 'fr-badge fr-badge--warning',
      'EN_COURS': 'fr-badge fr-badge--info',
      'TRAITE': 'fr-badge fr-badge--success',
      'ANNULE': 'fr-badge fr-badge--error'
    };
    return badges[statut] || 'fr-badge';
  };

  const getStatusLabel = (statut: string) => {
    const labels: Record<string, string> = {
      'EN_ATTENTE': 'En attente',
      'EN_COURS': 'En cours',
      'TRAITE': 'Traité',
      'ANNULE': 'Annulé'
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

  return (
    <div className="fr-container fr-py-6w">
      {/* En-tête */}
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12">
          <div className="fr-mb-4w">
            <h1 className="fr-h1">Gestion des demandes de partenariat</h1>
            <p className="fr-text--lead">
              Créez et suivez vos demandes de partenariat avec les lycées professionnels
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
              className="fr-btn fr-btn--icon-left fr-icon-add-line"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? 'Annuler' : 'Nouvelle demande'}
            </button>
            <button
              className="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-refresh-line"
              onClick={loadDemandes}
              disabled={loading}
            >
              Actualiser
            </button>
          </div>

          {/* Formulaire de création */}
          {showCreateForm && (
            <div className="fr-card fr-card--no-border fr-mb-6w">
              <div className="fr-card__body">
                <div className="fr-card__content">
                  <h3 className="fr-card__title">Nouvelle demande de partenariat</h3>
                  
                  {/* Section d'aide */}
                  <div className="fr-callout fr-callout--info fr-mb-4w">
                    <h4 className="fr-callout__title">Comment remplir ce formulaire ?</h4>
                    <p><strong>Entreprise :</strong> Recherchez l'entreprise partenaire par son nom ou SIRET. Si elle n'existe pas, nous la créerons automatiquement.</p>
                    <p><strong>Type de partenariat :</strong> Stage (immersion courte), Apprentissage (formation en alternance), Projet (collaboration ponctuelle).</p>
                    <p><strong>Priorité :</strong> Normale pour la plupart des demandes, Haute/Urgente pour les besoins immédiats.</p>
                  </div>
                  
                  <form onSubmit={handleCreateDemande}>
                    <div className="fr-grid-row fr-grid-row--gutters">
                      <div className="fr-col-12 fr-col-md-6">
                        <div className="fr-search-group">
                          <label className="fr-label" htmlFor="entreprise_id">
                            Entreprise *
                            <span className="fr-hint-text">Recherchez par nom d'entreprise ou SIRET</span>
                          </label>
                          <div className="fr-search-bar">
                            <input
                              className="fr-input"
                              type="text"
                              id="entreprise_id"
                              value={formData.entreprise_id}
                              onChange={(e) => setFormData({...formData, entreprise_id: e.target.value})}
                              placeholder="Ex: Renault, 123456789, Boulangerie Martin..."
                              required
                            />
                            <button 
                              className="fr-btn fr-btn--icon-only fr-icon-search-line" 
                              type="button"
                              title="Rechercher une entreprise"
                              onClick={() => {
                                // TODO: Ouvrir modal de recherche d'entreprise
                                alert('Fonctionnalité de recherche à venir !\n\nPour l\'instant, vous pouvez :\n- Saisir un nom d\'entreprise\n- Utiliser un SIRET\n- Ou créer une nouvelle entreprise');
                              }}
                            >
                              Rechercher
                            </button>
                          </div>
                          <div className="fr-hint-text fr-mt-1w">
                            💡 <strong>Astuce :</strong> Si votre entreprise partenaire n'existe pas encore, 
                            nous la créerons automatiquement lors de la validation.
                          </div>
                        </div>
                      </div>

                      <div className="fr-col-12 fr-col-md-6">
                        <div className="fr-select-group">
                          <label className="fr-label" htmlFor="type_partenariat">
                            Type de partenariat
                          </label>
                          <select
                            className="fr-select"
                            id="type_partenariat"
                            value={formData.type_partenariat}
                            onChange={(e) => setFormData({...formData, type_partenariat: e.target.value})}
                          >
                            <option value="stage">Stage</option>
                            <option value="apprentissage">Apprentissage</option>
                            <option value="visite">Visite d'entreprise</option>
                            <option value="conference">Conférence</option>
                            <option value="autre">Autre</option>
                          </select>
                        </div>
                      </div>

                      <div className="fr-col-12">
                        <div className="fr-input-group">
                          <label className="fr-label" htmlFor="titre">
                            Titre de la demande *
                          </label>
                          <input
                            className="fr-input"
                            type="text"
                            id="titre"
                            value={formData.titre}
                            onChange={(e) => setFormData({...formData, titre: e.target.value})}
                            placeholder="Décrivez brièvement votre demande"
                            required
                          />
                        </div>
                      </div>

                      <div className="fr-col-12">
                        <div className="fr-input-group">
                          <label className="fr-label" htmlFor="description">
                            Description détaillée
                          </label>
                          <textarea
                            className="fr-input"
                            id="description"
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Décrivez en détail votre demande de partenariat..."
                          />
                        </div>
                      </div>

                      <div className="fr-col-12 fr-col-md-6">
                        <div className="fr-select-group">
                          <label className="fr-label" htmlFor="priorite">
                            Priorité
                          </label>
                          <select
                            className="fr-select"
                            id="priorite"
                            value={formData.priorite}
                            onChange={(e) => setFormData({...formData, priorite: e.target.value as any})}
                          >
                            <option value="BASSE">Basse</option>
                            <option value="NORMALE">Normale</option>
                            <option value="HAUTE">Haute</option>
                            <option value="URGENTE">Urgente</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="fr-btns-group fr-mt-4w">
                      <button type="submit" className="fr-btn">
                        Créer la demande
                      </button>
                      <button
                        type="button"
                        className="fr-btn fr-btn--secondary"
                        onClick={() => setShowCreateForm(false)}
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Liste des demandes */}
          <div className="fr-table fr-table--bordered">
            <div className="fr-table__wrapper">
              <div className="fr-table__container">
                <div className="fr-table__content">
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">Titre</th>
                        <th scope="col">Entreprise</th>
                        <th scope="col">Type</th>
                        <th scope="col">Statut</th>
                        <th scope="col">Priorité</th>
                        <th scope="col">Lycées assignés</th>
                        <th scope="col">Date création</th>
                        <th scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={8} className="fr-text--center fr-py-4w">
                            Chargement des demandes...
                          </td>
                        </tr>
                      ) : demandes.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="fr-text--center fr-py-4w">
                            Aucune demande trouvée
                          </td>
                        </tr>
                      ) : (
                        demandes.map((demande) => (
                          <tr key={demande.id}>
                            <td>
                              <strong>{demande.titre}</strong>
                              {demande.description && (
                                <>
                                  <br />
                                  <small className="fr-text--xs text-gray-600">
                                    {demande.description.substring(0, 50)}...
                                  </small>
                                </>
                              )}
                            </td>
                            <td>{demande.entreprise_nom || demande.entreprise_id}</td>
                            <td>
                              <span className="fr-badge fr-badge--blue-ecume">
                                {demande.type_partenariat || 'Non spécifié'}
                              </span>
                            </td>
                            <td>
                              <span className={getStatusBadge(demande.statut)}>
                                {getStatusLabel(demande.statut)}
                              </span>
                            </td>
                            <td>
                              <span className={getPriorityBadge('NORMALE')}>
                                Normale
                              </span>
                            </td>
                            <td className="fr-text--center">
                              <span className="fr-badge fr-badge--info">
                                {demande.nb_lycees_assignes || 0}
                              </span>
                            </td>
                            <td>
                              {new Date(demande.date_creation).toLocaleDateString('fr-FR')}
                            </td>
                            <td>
                              <div className="fr-btns-group fr-btns-group--sm">
                                <button className="fr-btn fr-btn--sm fr-btn--secondary">
                                  Voir
                                </button>
                                <button className="fr-btn fr-btn--sm">
                                  Modifier
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

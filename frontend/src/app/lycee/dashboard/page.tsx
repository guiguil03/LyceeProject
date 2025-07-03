'use client';

import React, { useState } from 'react';

interface Formation {
  id: string;
  intitule: string;
  domaine: string;
  metier: string;
  modalite: string;
}

interface PlateauTechnique {
  id: string;
  nom: string;
  description: string;
}

export default function LyceeDashboard() {
  const [activeTab, setActiveTab] = useState('informations');
  const [lyceeData, setLyceeData] = useState({
    nom: 'Lycée professionnel Pierre Mendès France',
    adresse: '88 Rue de Paris, 59000 Lille',
    telephone: '03 20 55 66 77',
    email: 'contact@mendes-france-lille.fr',
    siteWeb: 'https://mendes-france-lille.fr',
    description: 'Lycée spécialisé dans les métiers du commerce et de l\'industrie',
    effectifs: {
      eleves: 850,
      apprentis: 120,
      enseignants: 65
    }
  });

  const [formations, setFormations] = useState<Formation[]>([
    {
      id: '1',
      intitule: 'Bac Pro Commerce',
      domaine: 'Commerce et vente',
      metier: 'Vendeur conseil',
      modalite: 'Alternance'
    },
    {
      id: '2',
      intitule: 'Bac Pro Maintenance des équipements industriels',
      domaine: 'Industrie et production',
      metier: 'Technicien de maintenance',
      modalite: 'Alternance'
    }
  ]);

  const [plateauxTechniques, setPlateauxTechniques] = useState<PlateauTechnique[]>([
    {
      id: '1',
      nom: 'Magasin pédagogique',
      description: 'Espace de vente reconstitué avec caisse et linéaires pour la formation commerce'
    }
  ]);

  const [newFormation, setNewFormation] = useState<Partial<Formation>>({});
  const [newPlateau, setNewPlateau] = useState<Partial<PlateauTechnique>>({});

  const tabs = [
    { id: 'informations', label: 'Informations générales', icon: 'fr-icon-information-line' },
    { id: 'formations', label: 'Nos formations', icon: 'fr-icon-book-2-line' },
    { id: 'plateaux', label: 'Plateaux techniques', icon: 'fr-icon-tools-line' },
    { id: 'demandes', label: 'Demandes d\'entreprises', icon: 'fr-icon-mail-line' },
    { id: 'statistiques', label: 'Statistiques', icon: 'fr-icon-bar-chart-line' }
  ];

  const handleAddFormation = () => {
    if (newFormation.intitule && newFormation.domaine) {
      setFormations([...formations, {
        id: Date.now().toString(),
        intitule: newFormation.intitule || '',
        domaine: newFormation.domaine || '',
        metier: newFormation.metier || '',
        modalite: newFormation.modalite || 'Alternance'
      }]);
      setNewFormation({});
    }
  };

  const handleAddPlateau = () => {
    if (newPlateau.nom && newPlateau.description) {
      setPlateauxTechniques([...plateauxTechniques, {
        id: Date.now().toString(),
        nom: newPlateau.nom || '',
        description: newPlateau.description || ''
      }]);
      setNewPlateau({});
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'informations':
        return (
          <div className="fr-container">
            <h3 className="fr-h3 fr-mb-4w">Informations de l'établissement</h3>
            
            <div className="fr-grid-row fr-grid-row--gutters">
              <div className="fr-col-12 fr-col-md-6">
                <div className="fr-input-group">
                  <label className="fr-label" htmlFor="nom">Nom de l'établissement</label>
                  <input
                    className="fr-input"
                    type="text"
                    id="nom"
                    value={lyceeData.nom}
                    onChange={(e) => setLyceeData({...lyceeData, nom: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="fr-col-12 fr-col-md-6">
                <div className="fr-input-group">
                  <label className="fr-label" htmlFor="telephone">Téléphone</label>
                  <input
                    className="fr-input"
                    type="tel"
                    id="telephone"
                    value={lyceeData.telephone}
                    onChange={(e) => setLyceeData({...lyceeData, telephone: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="fr-input-group">
              <label className="fr-label" htmlFor="adresse">Adresse complète</label>
              <textarea
                className="fr-input"
                id="adresse"
                rows={3}
                value={lyceeData.adresse}
                onChange={(e) => setLyceeData({...lyceeData, adresse: e.target.value})}
              />
            </div>

            <div className="fr-grid-row fr-grid-row--gutters">
              <div className="fr-col-12 fr-col-md-6">
                <div className="fr-input-group">
                  <label className="fr-label" htmlFor="email">Email de contact</label>
                  <input
                    className="fr-input"
                    type="email"
                    id="email"
                    value={lyceeData.email}
                    onChange={(e) => setLyceeData({...lyceeData, email: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="fr-col-12 fr-col-md-6">
                <div className="fr-input-group">
                  <label className="fr-label" htmlFor="siteWeb">Site web</label>
                  <input
                    className="fr-input"
                    type="url"
                    id="siteWeb"
                    value={lyceeData.siteWeb}
                    onChange={(e) => setLyceeData({...lyceeData, siteWeb: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="fr-input-group">
              <label className="fr-label" htmlFor="description">Description de l'établissement</label>
              <textarea
                className="fr-input"
                id="description"
                rows={4}
                value={lyceeData.description}
                onChange={(e) => setLyceeData({...lyceeData, description: e.target.value})}
                placeholder="Présentez votre lycée, ses spécialités, ses atouts..."
              />
            </div>

            <h4 className="fr-h4 fr-mt-6w fr-mb-4w">Effectifs</h4>
            <div className="fr-grid-row fr-grid-row--gutters">
              <div className="fr-col-12 fr-col-md-4">
                <div className="fr-input-group">
                  <label className="fr-label" htmlFor="eleves">Nombre d'élèves</label>
                  <input
                    className="fr-input"
                    type="number"
                    id="eleves"
                    value={lyceeData.effectifs.eleves}
                    onChange={(e) => setLyceeData({
                      ...lyceeData, 
                      effectifs: {...lyceeData.effectifs, eleves: parseInt(e.target.value)}
                    })}
                  />
                </div>
              </div>
              
              <div className="fr-col-12 fr-col-md-4">
                <div className="fr-input-group">
                  <label className="fr-label" htmlFor="apprentis">Nombre d'apprentis</label>
                  <input
                    className="fr-input"
                    type="number"
                    id="apprentis"
                    value={lyceeData.effectifs.apprentis}
                    onChange={(e) => setLyceeData({
                      ...lyceeData, 
                      effectifs: {...lyceeData.effectifs, apprentis: parseInt(e.target.value)}
                    })}
                  />
                </div>
              </div>
              
              <div className="fr-col-12 fr-col-md-4">
                <div className="fr-input-group">
                  <label className="fr-label" htmlFor="enseignants">Nombre d'enseignants</label>
                  <input
                    className="fr-input"
                    type="number"
                    id="enseignants"
                    value={lyceeData.effectifs.enseignants}
                    onChange={(e) => setLyceeData({
                      ...lyceeData, 
                      effectifs: {...lyceeData.effectifs, enseignants: parseInt(e.target.value)}
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="fr-btns-group fr-btns-group--right fr-mt-6w">
              <button className="fr-btn">
                Sauvegarder les informations
              </button>
            </div>
          </div>
        );

      case 'formations':
        return (
          <div className="fr-container">
            <div className="fr-grid-row fr-grid-row--gutters fr-mb-6w">
              <div className="fr-col-12 fr-col-md-8">
                <h3 className="fr-h3">Nos formations</h3>
                <p className="fr-text--lead">
                  Présentez les formations disponibles dans votre établissement
                </p>
              </div>
              <div className="fr-col-12 fr-col-md-4 fr-text--right">
                <button 
                  className="fr-btn fr-btn--icon-left fr-icon-add-line"
                  onClick={() => document.getElementById('add-formation-modal')?.setAttribute('aria-hidden', 'false')}
                >
                  Ajouter une formation
                </button>
              </div>
            </div>

            {/* Liste des formations */}
            <div className="fr-grid-row fr-grid-row--gutters">
              {formations.map((formation) => (
                <div key={formation.id} className="fr-col-12 fr-col-md-6 fr-col-lg-4">
                  <div className="fr-card fr-card--no-arrow">
                    <div className="fr-card__body">
                      <div className="fr-card__content">
                        <h4 className="fr-card__title">{formation.intitule}</h4>
                        <p className="fr-card__desc">
                          <strong>Domaine :</strong> {formation.domaine}<br/>
                          <strong>Métier :</strong> {formation.metier}<br/>
                          <strong>Modalité :</strong> {formation.modalite}
                        </p>
                        <div className="fr-btns-group fr-btns-group--sm">
                          <button className="fr-btn fr-btn--secondary fr-btn--sm">
                            Modifier
                          </button>
                          <button className="fr-btn fr-btn--secondary fr-btn--sm">
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal d'ajout de formation */}
            <dialog id="add-formation-modal" className="fr-modal" aria-labelledby="add-formation-modal-title">
              <div className="fr-container fr-container--fluid fr-container-md">
                <div className="fr-grid-row fr-grid-row--center">
                  <div className="fr-col-12 fr-col-md-8 fr-col-lg-6">
                    <div className="fr-modal__body">
                      <div className="fr-modal__header">
                        <button 
                          className="fr-btn--close fr-btn" 
                          title="Fermer"
                          onClick={() => document.getElementById('add-formation-modal')?.setAttribute('aria-hidden', 'true')}
                        >
                          Fermer
                        </button>
                      </div>
                      <div className="fr-modal__content">
                        <h1 id="add-formation-modal-title" className="fr-modal__title">
                          Ajouter une formation
                        </h1>
                        
                        <div className="fr-input-group">
                          <label className="fr-label" htmlFor="new-formation-intitule">
                            Intitulé de la formation
                          </label>
                          <input
                            className="fr-input"
                            type="text"
                            id="new-formation-intitule"
                            value={newFormation.intitule || ''}
                            onChange={(e) => setNewFormation({...newFormation, intitule: e.target.value})}
                            placeholder="Ex: Bac Pro Commerce"
                          />
                        </div>

                        <div className="fr-input-group">
                          <label className="fr-label" htmlFor="new-formation-domaine">
                            Domaine d'activité
                          </label>
                          <select
                            className="fr-select"
                            id="new-formation-domaine"
                            value={newFormation.domaine || ''}
                            onChange={(e) => setNewFormation({...newFormation, domaine: e.target.value})}
                          >
                            <option value="">Sélectionnez un domaine</option>
                            <option value="Commerce et vente">Commerce et vente</option>
                            <option value="Industrie et production">Industrie et production</option>
                            <option value="Informatique et numérique">Informatique et numérique</option>
                            <option value="Bâtiment et travaux publics">Bâtiment et travaux publics</option>
                            <option value="Restauration et hôtellerie">Restauration et hôtellerie</option>
                          </select>
                        </div>

                        <div className="fr-input-group">
                          <label className="fr-label" htmlFor="new-formation-metier">
                            Métier visé
                          </label>
                          <input
                            className="fr-input"
                            type="text"
                            id="new-formation-metier"
                            value={newFormation.metier || ''}
                            onChange={(e) => setNewFormation({...newFormation, metier: e.target.value})}
                            placeholder="Ex: Vendeur conseil"
                          />
                        </div>

                        <div className="fr-input-group">
                          <label className="fr-label" htmlFor="new-formation-modalite">
                            Modalité
                          </label>
                          <select
                            className="fr-select"
                            id="new-formation-modalite"
                            value={newFormation.modalite || 'Alternance'}
                            onChange={(e) => setNewFormation({...newFormation, modalite: e.target.value})}
                          >
                            <option value="Alternance">Alternance</option>
                            <option value="Stage">Stage</option>
                            <option value="Formation continue">Formation continue</option>
                          </select>
                        </div>

                        <div className="fr-btns-group fr-btns-group--right fr-mt-4w">
                          <button 
                            className="fr-btn fr-btn--secondary"
                            onClick={() => document.getElementById('add-formation-modal')?.setAttribute('aria-hidden', 'true')}
                          >
                            Annuler
                          </button>
                          <button 
                            className="fr-btn"
                            onClick={() => {
                              handleAddFormation();
                              document.getElementById('add-formation-modal')?.setAttribute('aria-hidden', 'true');
                            }}
                          >
                            Ajouter
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </dialog>
          </div>
        );

      case 'plateaux':
        return (
          <div className="fr-container">
            <div className="fr-grid-row fr-grid-row--gutters fr-mb-6w">
              <div className="fr-col-12 fr-col-md-8">
                <h3 className="fr-h3">Plateaux techniques</h3>
                <p className="fr-text--lead">
                  Valorisez vos équipements et infrastructures techniques
                </p>
              </div>
              <div className="fr-col-12 fr-col-md-4 fr-text--right">
                <button className="fr-btn fr-btn--icon-left fr-icon-add-line">
                  Ajouter un plateau
                </button>
              </div>
            </div>

            <div className="fr-grid-row fr-grid-row--gutters">
              {plateauxTechniques.map((plateau) => (
                <div key={plateau.id} className="fr-col-12 fr-col-md-6">
                  <div className="fr-card fr-card--no-arrow">
                    <div className="fr-card__body">
                      <div className="fr-card__content">
                        <h4 className="fr-card__title">
                          <span className="fr-icon-tools-line fr-mr-1w" aria-hidden="true"></span>
                          {plateau.nom}
                        </h4>
                        <p className="fr-card__desc">{plateau.description}</p>
                        <div className="fr-btns-group fr-btns-group--sm">
                          <button className="fr-btn fr-btn--secondary fr-btn--sm">
                            Modifier
                          </button>
                          <button className="fr-btn fr-btn--secondary fr-btn--sm">
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'demandes':
        return (
          <div className="fr-container">
            <h3 className="fr-h3 fr-mb-4w">Demandes d'entreprises</h3>
            
            <div className="fr-alert fr-alert--info fr-mb-4w">
              <p>Vous avez <strong>3 nouvelles demandes</strong> d'entreprises à traiter.</p>
            </div>

            <div className="fr-table fr-table--bordered">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Entreprise</th>
                    <th scope="col">Métier recherché</th>
                    <th scope="col">Date</th>
                    <th scope="col">Statut</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>TechSolutions SARL</td>
                    <td>Développeur web</td>
                    <td>02/07/2025</td>
                    <td><span className="fr-badge fr-badge--new">Nouveau</span></td>
                    <td>
                      <div className="fr-btns-group fr-btns-group--sm">
                        <button className="fr-btn fr-btn--sm">Répondre</button>
                        <button className="fr-btn fr-btn--secondary fr-btn--sm">Voir détails</button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>BatiPro SAS</td>
                    <td>Électricien</td>
                    <td>01/07/2025</td>
                    <td><span className="fr-badge fr-badge--info">En cours</span></td>
                    <td>
                      <div className="fr-btns-group fr-btns-group--sm">
                        <button className="fr-btn fr-btn--sm">Répondre</button>
                        <button className="fr-btn fr-btn--secondary fr-btn--sm">Voir détails</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'statistiques':
        return (
          <div className="fr-container">
            <h3 className="fr-h3 fr-mb-4w">Statistiques de l'établissement</h3>
            
            <div className="fr-grid-row fr-grid-row--gutters fr-mb-6w">
              <div className="fr-col-12 fr-col-md-3">
                <div className="fr-card fr-card--no-arrow">
                  <div className="fr-card__body">
                    <div className="fr-card__content">
                      <h4 className="fr-card__title">
                        <span className="fr-icon-user-line fr-mr-1w" aria-hidden="true"></span>
                        Demandes reçues
                      </h4>
                      <p className="fr-card__desc">
                        <span className="fr-text--xl fr-text--bold">12</span><br/>
                        Ce mois-ci
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="fr-col-12 fr-col-md-3">
                <div className="fr-card fr-card--no-arrow">
                  <div className="fr-card__body">
                    <div className="fr-card__content">
                      <h4 className="fr-card__title">
                        <span className="fr-icon-check-line fr-mr-1w" aria-hidden="true"></span>
                        Taux d'acceptation
                      </h4>
                      <p className="fr-card__desc">
                        <span className="fr-text--xl fr-text--bold">75%</span><br/>
                        Moyenne mensuelle
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="fr-col-12 fr-col-md-3">
                <div className="fr-card fr-card--no-arrow">
                  <div className="fr-card__body">
                    <div className="fr-card__content">
                      <h4 className="fr-card__title">
                        <span className="fr-icon-building-line fr-mr-1w" aria-hidden="true"></span>
                        Entreprises partenaires
                      </h4>
                      <p className="fr-card__desc">
                        <span className="fr-text--xl fr-text--bold">28</span><br/>
                        Actives
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="fr-col-12 fr-col-md-3">
                <div className="fr-card fr-card--no-arrow">
                  <div className="fr-card__body">
                    <div className="fr-card__content">
                      <h4 className="fr-card__title">
                        <span className="fr-icon-time-line fr-mr-1w" aria-hidden="true"></span>
                        Temps de réponse
                      </h4>
                      <p className="fr-card__desc">
                        <span className="fr-text--xl fr-text--bold">2.5j</span><br/>
                        Moyenne
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="fr-callout">
              <h4 className="fr-callout__title">Conseil</h4>
              <p>
                Pour améliorer votre visibilité, pensez à mettre à jour régulièrement 
                vos informations et à répondre rapidement aux demandes d'entreprises.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fr-container-fluid fr-py-4w">
      {/* En-tête du dashboard */}
      <div className="fr-container fr-mb-6w">
        <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--middle">
          <div className="fr-col-12 fr-col-md-8">
            <h1 className="fr-h1 fr-mb-2w">
              <span className="fr-icon-school-line fr-mr-2w" aria-hidden="true"></span>
              Dashboard Lycée
            </h1>
            <p className="fr-text--lead fr-mb-0">
              Gérez et valorisez votre établissement sur LycéeConnect
            </p>
          </div>
          <div className="fr-col-12 fr-col-md-4 fr-text--right">
            <button className="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-logout-box-r-line">
              Se déconnecter
            </button>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="fr-container fr-mb-4w">
        <nav className="fr-tabs">
          <ul className="fr-tabs__list" role="tablist">
            {tabs.map((tab) => (
              <li key={tab.id} role="presentation">
                <button
                  className={`fr-tabs__tab ${activeTab === tab.id ? 'fr-tabs__tab--selected' : ''}`}
                  id={`tabpanel-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className={`${tab.icon} fr-mr-1w`} aria-hidden="true"></span>
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Contenu de l'onglet actif */}
      <div className="fr-tabs__panel fr-tabs__panel--selected">
        {renderTabContent()}
      </div>
    </div>
  );
} 
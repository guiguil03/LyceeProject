'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function ProfilLyceePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Données du lycée (à remplacer par un appel API)
  const [profileData, setProfileData] = useState({
    nom: user?.name || 'Lycée Professionnel Test',
    codeUai: '0123456A',
    adresse: '123 Rue de l\'Éducation',
    ville: 'Paris',
    codePostal: '75001',
    telephone: '01 23 45 67 89',
    email: user?.email || 'contact@lycee-test.fr',
    siteWeb: 'https://www.lycee-test.fr',
    description: 'Un lycée professionnel d\'excellence formant aux métiers de demain avec des partenariats entreprises solides.',
    secteurs: ['Commerce', 'Informatique', 'Industrie', 'Services'],
    effectif: '450',
    nombreFormations: '12',
    tauxReussite: '89%',
    tauxInsertion: '95%',
    formations: [
      'BAC Pro Commerce',
      'BAC Pro Systèmes Numériques',
      'BTS Comptabilité et Gestion',
      'CAP Électricien',
      'BAC Pro Maintenance des Équipements Industriels'
    ],
    equipements: [
      'Atelier mécanique moderne',
      'Laboratoire informatique',
      'Plateau technique électronique',
      'Espace de simulation commerciale'
    ],
    partenariats: [
      'Plus de 50 entreprises partenaires',
      'Réseau régional des CFA',
      'Partenariat avec la CCI locale'
    ]
  });

  // Redirection si non connecté ou pas un lycée
  React.useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated) {
      router.push('/auth?type=lycee');
    } else if (isAuthenticated && user && user.type !== 'lycee') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router, isLoading]);

  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <div className="fr-container fr-py-12w">
        <div className="fr-text--center">
          <div className="fr-loader" aria-hidden="true"></div>
          <p className="fr-mt-2w">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  // Afficher la redirection seulement si on est sûr que ce n'est pas un lycée
  if (!isAuthenticated || (user && user.type !== 'lycee')) {
    return (
      <div className="fr-container fr-py-12w">
        <div className="fr-text--center">
          <div className="fr-loader" aria-hidden="true"></div>
          <p className="fr-mt-2w">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (field: 'secteurs' | 'formations' | 'equipements' | 'partenariats', index: number, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'secteurs' | 'formations' | 'equipements' | 'partenariats') => {
    setProfileData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'secteurs' | 'formations' | 'equipements' | 'partenariats', index: number) => {
    setProfileData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessage('Profil mis à jour avec succès !');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="fr-container fr-py-6w">
      {/* Header avec breadcrumb et actions */}
      <div className="fr-mb-6w">
        {/* Breadcrumb */}
        <nav className="fr-breadcrumb fr-mb-4w" aria-label="vous êtes ici :">
          <button 
            onClick={() => router.push('/lycee')}
            className="fr-breadcrumb__button"
            aria-current="false"
          >
            Mon Lycée
          </button>
          <ol className="fr-breadcrumb__list">
            <li>
              <a className="fr-breadcrumb__link" href="#" aria-current="page">Gérer mon profil</a>
            </li>
          </ol>
        </nav>

        {/* Titre et actions */}
        <div className="fr-grid-row fr-grid-row--middle fr-grid-row--gutters">
          <div className="fr-col">
            <div className="fr-mb-2w">
              <p className="fr-badge fr-badge--blue-ecume fr-badge--sm">
                <span className="ri-building-line fr-mr-1w" aria-hidden="true"></span>
                Établissement
              </p>
            </div>
            <h1 className="fr-h1 fr-mb-2w">
              <span className="ri-user-settings-line fr-mr-2w" aria-hidden="true"></span>
              Gestion du profil
            </h1>
            <p className="fr-text--lead fr-text--grey fr-mb-0">
              Gérez les informations de votre établissement et présentez-vous aux entreprises partenaires
            </p>
          </div>
          <div className="fr-col-auto">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="fr-btn fr-btn--icon-left"
              >
                <span className="ri-edit-line" aria-hidden="true"></span>
                Modifier
              </button>
            ) : (
              <div className="fr-btns-group fr-btns-group--sm">
                <button 
                  onClick={handleCancel}
                  className="fr-btn fr-btn--tertiary fr-btn--icon-left"
                >
                  <span className="ri-close-line" aria-hidden="true"></span>
                  Annuler
                </button>
                <button 
                  onClick={handleSave}
                  className="fr-btn fr-btn--icon-left"
                  disabled={isSaving}
                >
                  <span className={isSaving ? "ri-loader-4-line fr-icon--rotating" : "ri-save-line"} aria-hidden="true"></span>
                  {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message de succès */}
      {successMessage && (
        <div className="fr-alert fr-alert--success fr-mb-4w">
          <h3 className="fr-alert__title">
            <span className="ri-check-line fr-mr-1w" aria-hidden="true"></span>
            Succès
          </h3>
          <p>{successMessage}</p>
        </div>
      )}

      {/* Informations générales */}
      <div className="fr-card fr-card--shadow fr-mb-4w">
        <div className="fr-card__body">
          <div className="fr-card__content">
            <h2 className="fr-h3 fr-mb-4w">
              <span className="ri-information-line fr-mr-2w" aria-hidden="true"></span>
              Informations générales
            </h2>

            <div className="fr-grid-row fr-grid-row--gutters">
              <div className="fr-col-12 fr-col-md-6">
                <div className="fr-input-group">
                  <label className="fr-label" htmlFor="nom">
                    <span className="ri-building-line fr-mr-1w" aria-hidden="true"></span>
                    Nom de l&apos;établissement
                  </label>
                  <input
                    className="fr-input"
                    type="text"
                    id="nom"
                    name="nom"
                    value={profileData.nom}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="fr-col-12 fr-col-md-6">
                <div className="fr-input-group">
                  <label className="fr-label" htmlFor="ville">
                    <span className="ri-map-pin-line fr-mr-1w" aria-hidden="true"></span>
                    Ville
                  </label>
                  <input
                    className="fr-input"
                    type="text"
                    id="ville"
                    name="ville"
                    value={profileData.ville}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            <div className="fr-grid-row fr-grid-row--gutters fr-mt-3w">
              <div className="fr-col-12">
                <div className="fr-input-group">
                  <label className="fr-label" htmlFor="adresse">
                    <span className="ri-road-map-line fr-mr-1w" aria-hidden="true"></span>
                    Adresse complète
                  </label>
                  <input
                    className="fr-input"
                    type="text"
                    id="adresse"
                    name="adresse"
                    value={profileData.adresse}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            <div className="fr-grid-row fr-grid-row--gutters fr-mt-3w">
              <div className="fr-col-12 fr-col-md-6">
                <div className="fr-input-group">
                  <label className="fr-label" htmlFor="telephone">
                    <span className="ri-phone-line fr-mr-1w" aria-hidden="true"></span>
                    Téléphone
                  </label>
                  <input
                    className="fr-input"
                    type="tel"
                    id="telephone"
                    name="telephone"
                    value={profileData.telephone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="fr-col-12 fr-col-md-6">
                <div className="fr-input-group">
                  <label className="fr-label" htmlFor="email">
                    <span className="ri-mail-line fr-mr-1w" aria-hidden="true"></span>
                    Email
                  </label>
                  <input
                    className="fr-input"
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            <div className="fr-input-group fr-mt-3w">
              <label className="fr-label" htmlFor="siteWeb">
                <span className="ri-global-line fr-mr-1w" aria-hidden="true"></span>
                Site web
              </label>
              <input
                className="fr-input"
                type="url"
                id="siteWeb"
                name="siteWeb"
                value={profileData.siteWeb}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="fr-input-group fr-mt-3w">
              <label className="fr-label" htmlFor="description">
                <span className="ri-file-text-line fr-mr-1w" aria-hidden="true"></span>
                Description de l&apos;établissement
              </label>
              <textarea
                className="fr-input"
                id="description"
                name="description"
                rows={4}
                value={profileData.description}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Formations et Secteurs en colonnes */}
      <div className="fr-grid-row fr-grid-row--gutters fr-mb-4w">
        {/* Formations */}
        <div className="fr-col-12 fr-col-lg-8">
          <div className="fr-card fr-card--shadow">
            <div className="fr-card__body">
              <div className="fr-card__content">
                <h2 className="fr-h3 fr-mb-4w">
                  <span className="ri-graduation-cap-line fr-mr-2w" aria-hidden="true"></span>
                  Formations proposées
                </h2>
                
                {profileData.formations.map((formation, index) => (
                  <div key={index} className="fr-input-group fr-mb-3w">
                    <div className="fr-grid-row fr-grid-row--middle fr-grid-row--gutters">
                      <div className="fr-col">
                        <input
                          className="fr-input"
                          type="text"
                          value={formation}
                          onChange={(e) => handleArrayChange('formations', index, e.target.value)}
                          disabled={!isEditing}
                          placeholder="Nom de la formation"
                        />
                      </div>
                      {isEditing && (
                        <div className="fr-col-auto">
                          <button
                            type="button"
                            onClick={() => removeArrayItem('formations', index)}
                            className="fr-btn fr-btn--tertiary fr-btn--sm fr-btn--icon-only"
                            title="Supprimer cette formation"
                          >
                            <span className="ri-delete-bin-line" aria-hidden="true"></span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => addArrayItem('formations')}
                    className="fr-btn fr-btn--tertiary fr-btn--sm fr-btn--icon-left"
                  >
                    <span className="ri-add-line" aria-hidden="true"></span>
                    Ajouter une formation
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Secteurs d'activité */}
        <div className="fr-col-12 fr-col-lg-4">
          <div className="fr-card fr-card--shadow">
            <div className="fr-card__body">
              <div className="fr-card__content">
                <h2 className="fr-h4 fr-mb-4w">
                  <span className="ri-stack-line fr-mr-2w" aria-hidden="true"></span>
                  Secteurs d&apos;activité
                </h2>
                
                {profileData.secteurs.map((secteur, index) => (
                  <div key={index} className="fr-input-group fr-mb-3w">
                    <div className="fr-grid-row fr-grid-row--middle fr-grid-row--gutters">
                      <div className="fr-col">
                        <input
                          className="fr-input"
                          type="text"
                          value={secteur}
                          onChange={(e) => handleArrayChange('secteurs', index, e.target.value)}
                          disabled={!isEditing}
                          placeholder="Secteur d'activité"
                        />
                      </div>
                      {isEditing && (
                        <div className="fr-col-auto">
                          <button
                            type="button"
                            onClick={() => removeArrayItem('secteurs', index)}
                            className="fr-btn fr-btn--tertiary fr-btn--sm fr-btn--icon-only"
                            title="Supprimer ce secteur"
                          >
                            <span className="ri-delete-bin-line" aria-hidden="true"></span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => addArrayItem('secteurs')}
                    className="fr-btn fr-btn--tertiary fr-btn--sm fr-btn--icon-left"
                  >
                    <span className="ri-add-line" aria-hidden="true"></span>
                    Ajouter un secteur
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Équipements */}
      <div className="fr-card fr-card--shadow fr-mb-4w">
        <div className="fr-card__body">
          <div className="fr-card__content">
            <h2 className="fr-h3 fr-mb-4w">
              <span className="ri-tools-line fr-mr-2w" aria-hidden="true"></span>
              Équipements et infrastructures
            </h2>
            
            {profileData.equipements.map((equipement, index) => (
              <div key={index} className="fr-input-group fr-mb-3w">
                <div className="fr-grid-row fr-grid-row--middle fr-grid-row--gutters">
                  <div className="fr-col">
                    <input
                      className="fr-input"
                      type="text"
                      value={equipement}
                      onChange={(e) => handleArrayChange('equipements', index, e.target.value)}
                      disabled={!isEditing}
                      placeholder="Description de l'équipement"
                    />
                  </div>
                  {isEditing && (
                    <div className="fr-col-auto">
                      <button
                        type="button"
                        onClick={() => removeArrayItem('equipements', index)}
                        className="fr-btn fr-btn--tertiary fr-btn--sm fr-btn--icon-only"
                        title="Supprimer cet équipement"
                      >
                        <span className="ri-delete-bin-line" aria-hidden="true"></span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isEditing && (
              <button
                type="button"
                onClick={() => addArrayItem('equipements')}
                className="fr-btn fr-btn--tertiary fr-btn--sm fr-btn--icon-left"
              >
                <span className="ri-add-line" aria-hidden="true"></span>
                Ajouter un équipement
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Statistiques et Partenariats en colonnes */}
      <div className="fr-grid-row fr-grid-row--gutters fr-mb-4w">
        {/* Statistiques */}
        <div className="fr-col-12 fr-col-lg-6">
          <div className="fr-card fr-card--shadow">
            <div className="fr-card__body">
              <div className="fr-card__content">
                <h2 className="fr-h3 fr-mb-4w">
                  <span className="ri-bar-chart-line fr-mr-2w" aria-hidden="true"></span>
                  Statistiques
                </h2>
                
                <div className="fr-grid-row fr-grid-row--gutters fr-mb-3w">
                  <div className="fr-col-6">
                    <div className="fr-input-group">
                      <label className="fr-label" htmlFor="effectif">
                        <span className="ri-group-line fr-mr-1w" aria-hidden="true"></span>
                        Effectif total
                      </label>
                      <input
                        className="fr-input"
                        type="text"
                        id="effectif"
                        name="effectif"
                        value={profileData.effectif}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="fr-col-6">
                    <div className="fr-input-group">
                      <label className="fr-label" htmlFor="nombreFormations">
                        <span className="ri-book-line fr-mr-1w" aria-hidden="true"></span>
                        Formations
                      </label>
                      <input
                        className="fr-input"
                        type="text"
                        id="nombreFormations"
                        name="nombreFormations"
                        value={profileData.nombreFormations}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>

                <div className="fr-grid-row fr-grid-row--gutters">
                  <div className="fr-col-6">
                    <div className="fr-input-group">
                      <label className="fr-label" htmlFor="tauxReussite">
                        <span className="ri-medal-line fr-mr-1w" aria-hidden="true"></span>
                        Taux réussite
                      </label>
                      <input
                        className="fr-input"
                        type="text"
                        id="tauxReussite"
                        name="tauxReussite"
                        value={profileData.tauxReussite}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="fr-col-6">
                    <div className="fr-input-group">
                      <label className="fr-label" htmlFor="tauxInsertion">
                        <span className="ri-briefcase-line fr-mr-1w" aria-hidden="true"></span>
                        Taux insertion
                      </label>
                      <input
                        className="fr-input"
                        type="text"
                        id="tauxInsertion"
                        name="tauxInsertion"
                        value={profileData.tauxInsertion}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Partenariats */}
        <div className="fr-col-12 fr-col-lg-6">
          <div className="fr-card fr-card--shadow">
            <div className="fr-card__body">
              <div className="fr-card__content">
                <h2 className="fr-h3 fr-mb-4w">
                  <span className="ri-handshake-line fr-mr-2w" aria-hidden="true"></span>
                  Partenariats entreprises
                </h2>
                
                {profileData.partenariats.map((partenariat, index) => (
                  <div key={index} className="fr-input-group fr-mb-3w">
                    <div className="fr-grid-row fr-grid-row--middle fr-grid-row--gutters">
                      <div className="fr-col">
                        <input
                          className="fr-input"
                          type="text"
                          value={partenariat}
                          onChange={(e) => handleArrayChange('partenariats', index, e.target.value)}
                          disabled={!isEditing}
                          placeholder="Description du partenariat"
                        />
                      </div>
                      {isEditing && (
                        <div className="fr-col-auto">
                          <button
                            type="button"
                            onClick={() => removeArrayItem('partenariats', index)}
                            className="fr-btn fr-btn--tertiary fr-btn--sm fr-btn--icon-only"
                            title="Supprimer ce partenariat"
                          >
                            <span className="ri-delete-bin-line" aria-hidden="true"></span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => addArrayItem('partenariats')}
                    className="fr-btn fr-btn--tertiary fr-btn--sm fr-btn--icon-left"
                  >
                    <span className="ri-add-line" aria-hidden="true"></span>
                    Ajouter un partenariat
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions en bas de page */}
      {isEditing && (
        <div className="fr-grid-row fr-grid-row--center fr-mt-6w">
          <div className="fr-col-auto">
            <div className="fr-btns-group fr-btns-group--center">
              <button 
                onClick={handleCancel}
                className="fr-btn fr-btn--tertiary fr-btn--icon-left"
              >
                <span className="ri-close-line" aria-hidden="true"></span>
                Annuler les modifications
              </button>
              <button 
                onClick={handleSave}
                className="fr-btn fr-btn--icon-left"
                disabled={isSaving}
              >
                <span className={isSaving ? "ri-loader-4-line fr-icon--rotating" : "ri-save-line"} aria-hidden="true"></span>
                {isSaving ? 'Sauvegarde en cours...' : 'Sauvegarder le profil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
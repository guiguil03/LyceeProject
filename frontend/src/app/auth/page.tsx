'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileType = searchParams.get('type') as 'entreprise' | 'lycee' | null;
  const { login, register } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nom: '',
    profil: {
      nom: '',
      adresse: '',
      siret: '',
      secteur: '',
      uai: '',
      formations: [] as string[]
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        router.push('/dashboard');
      } else {
        // Validation des mots de passe
        if (formData.password !== formData.confirmPassword) {
          setError('Les mots de passe ne correspondent pas');
          setLoading(false);
          return;
        }

        // Déterminer le rôle basé sur le type de profil
        const role = profileType === 'lycee' ? 'LYCEE_ADMIN' : 'ENTREPRISE_ADMIN';
        
        const userData = {
          email: formData.email,
          password: formData.password,
          role,
          full_name: formData.nom,
          // Ajouter les données spécifiques au profil
          ...(profileType === 'entreprise' && {
            siret: formData.profil.siret,
            nom_entreprise: formData.profil.nom
          }),
          ...(profileType === 'lycee' && {
            lycee_id: formData.profil.uai // Utiliser l'UAI comme ID temporaire
          })
        };

        await register(userData);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('profil.')) {
      const profilField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        profil: {
          ...prev.profil,
          [profilField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  if (!profileType) {
    router.push('/');
    return null;
  }

  return (
    <div className="fr-container fr-py-6w">
      <div className="fr-grid-row fr-grid-row--center">
        <div className="fr-col-12 fr-col-md-8 fr-col-lg-6">
          
          {/* En-tête */}
          <div className="fr-mb-6w">
            <div className="fr-mb-2w">
              <button 
                onClick={() => router.push('/')}
                className="fr-btn fr-btn--tertiary fr-btn--sm fr-btn--icon-left fr-icon-arrow-left-line"
              >
                Retour à l'accueil
              </button>
            </div>
            
            <div className="fr-mb-4w">
              <p className="fr-badge fr-badge--blue-ecume">
                <span className={`fr-icon-${profileType === 'entreprise' ? 'building' : 'school'}-line fr-mr-1w`} aria-hidden="true"></span>
                {profileType === 'entreprise' ? 'Espace Entreprise' : 'Espace Lycée'}
              </p>
            </div>
            
            <h1 className="fr-h1">
              {isLogin ? 'Connexion' : 'Inscription'}
            </h1>
            <p className="fr-text--lead">
              {isLogin 
                ? `Connectez-vous à votre espace ${profileType === 'entreprise' ? 'entreprise' : 'lycée'}`
                : `Créez votre compte ${profileType === 'entreprise' ? 'entreprise' : 'lycée'}`
              }
            </p>
          </div>

          {/* Affichage des erreurs */}
          {error && (
            <div className="fr-alert fr-alert--error fr-mb-4w">
              <p>{error}</p>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit}>
            <div className="fr-input-group">
              <label className="fr-label" htmlFor="email">
                Adresse e-mail
                <span className="fr-hint-text">L'adresse e-mail de votre {profileType === 'entreprise' ? 'entreprise' : 'établissement'}</span>
              </label>
              <input
                className="fr-input"
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="fr-input-group">
              <label className="fr-label" htmlFor="password">
                Mot de passe
              </label>
              <input
                className="fr-input"
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            {!isLogin && (
              <>
                <div className="fr-input-group">
                  <label className="fr-label" htmlFor="confirmPassword">
                    Confirmer le mot de passe
                  </label>
                  <input
                    className="fr-input"
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="fr-input-group">
                  <label className="fr-label" htmlFor="nom">
                    Nom du contact
                  </label>
                  <input
                    className="fr-input"
                    type="text"
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="fr-input-group">
                  <label className="fr-label" htmlFor="profil.nom">
                    Nom de {profileType === 'entreprise' ? "l'entreprise" : "l'établissement"}
                  </label>
                  <input
                    className="fr-input"
                    type="text"
                    id="profil.nom"
                    name="profil.nom"
                    value={formData.profil.nom}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {profileType === 'entreprise' ? (
                  <>
                    <div className="fr-input-group">
                      <label className="fr-label" htmlFor="profil.siret">
                        SIRET
                      </label>
                      <input
                        className="fr-input"
                        type="text"
                        id="profil.siret"
                        name="profil.siret"
                        value={formData.profil.siret}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="fr-select-group">
                      <label className="fr-label" htmlFor="profil.secteur">
                        Secteur d'activité
                      </label>
                      <select
                        className="fr-select"
                        id="profil.secteur"
                        name="profil.secteur"
                        value={formData.profil.secteur}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Choisir un secteur</option>
                        <option value="agriculture">Agriculture</option>
                        <option value="industrie">Industrie</option>
                        <option value="batiment">Bâtiment et travaux publics</option>
                        <option value="commerce">Commerce et vente</option>
                        <option value="services">Services</option>
                        <option value="transport">Transport et logistique</option>
                        <option value="tourisme">Tourisme et hôtellerie</option>
                        <option value="sante">Santé et social</option>
                        <option value="numerique">Numérique et informatique</option>
                        <option value="artisanat">Artisanat</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <div className="fr-input-group">
                    <label className="fr-label" htmlFor="profil.uai">
                      Code UAI
                      <span className="fr-hint-text">Unité Administrative Immatriculée de votre établissement</span>
                    </label>
                    <input
                      className="fr-input"
                      type="text"
                      id="profil.uai"
                      name="profil.uai"
                      value={formData.profil.uai}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                )}

                <div className="fr-input-group">
                  <label className="fr-label" htmlFor="profil.adresse">
                    Adresse
                  </label>
                  <input
                    className="fr-input"
                    type="text"
                    id="profil.adresse"
                    name="profil.adresse"
                    value={formData.profil.adresse}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </>
            )}

            <div className="fr-btns-group fr-btns-group--right fr-mt-4w">
              <button
                type="button"
                className="fr-btn fr-btn--tertiary"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
              </button>
              <button
                type="submit"
                className="fr-btn fr-btn--icon-left fr-icon-check-line"
                disabled={loading}
              >
                {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : "S'inscrire")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

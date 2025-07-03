"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileType = searchParams.get("type") as "entreprise" | "lycee" | null;
  const { login, register, isAuthenticated, isLoading } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nom: "",
    profil: {
      nom: "",
      adresse: "",
      siret: "",
      secteur: "",
      uai: "",
      formations: [] as string[],
    },
  });

  // Redirection si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!profileType) {
      setError("Type de profil non spécifié");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const result = await login(
          formData.email,
          formData.password,
          profileType
        );
        if (result.success) {
          // Redirection selon le type d'utilisateur
          if (profileType === "lycee") {
            router.push("/lycee");
          } else {
            router.push("/");
          }
        } else {
          setError(result.error || "Erreur de connexion");
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError("Les mots de passe ne correspondent pas");
          setLoading(false);
          return;
        }

        const name = formData.profil.nom || formData.nom;
        const additionalData =
          profileType === "lycee"
            ? { uai: formData.profil.uai }
            : { siret: formData.profil.siret };
        const result = await register(
          formData.email,
          formData.password,
          name,
          profileType,
          additionalData
        );
        if (result.success) {
          // Redirection selon le type d'utilisateur après inscription
          if (profileType === "lycee") {
            router.push("/lycee");
          } else {
            router.push("/");
          }
        } else {
          setError(result.error || "Erreur lors de l'inscription");
        }
      }
    } catch (err) {
      setError("Une erreur est survenue");
      console.error("Erreur auth:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("profil.")) {
      const profilField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        profil: {
          ...prev.profil,
          [profilField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  if (!profileType) {
    router.push("/");
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
                onClick={() => router.push("/")}
                className="fr-btn fr-btn--tertiary fr-btn--sm fr-btn--icon-left fr-icon-arrow-left-line"
              >
                Retour à l&apos;accueil
              </button>
            </div>

            <div className="fr-mb-4w">
              <p className="fr-text--lg fr-text--bold">
                <span
                  className={`${
                    profileType === "entreprise"
                      ? "fr-icon-building-line"
                      : "fr-icon-book-2-line"
                  } fr-mr-1w`}
                  aria-hidden="true"
                ></span>
                {profileType === "entreprise"
                  ? "Espace Entreprise"
                  : "Espace Lycée"}
              </p>
            </div>

            <h1 className="fr-h1">{isLogin ? "Connexion" : "Inscription"}</h1>
            <p className="fr-text--lead">
              {isLogin
                ? `Connectez-vous à votre espace ${
                    profileType === "entreprise" ? "entreprise" : "lycée"
                  }`
                : `Créez votre compte ${
                    profileType === "entreprise" ? "entreprise" : "lycée"
                  }`}
            </p>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="fr-alert fr-alert--error fr-mb-4w">
              <h3 className="fr-alert__title">Erreur</h3>
              <p>{error}</p>
            </div>
          )}

          {/* Indicateur de chargement global */}
          {(isLoading || loading) && (
            <div className="fr-alert fr-alert--info fr-mb-4w">
              <h3 className="fr-alert__title">Chargement...</h3>
              <p>Veuillez patienter</p>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit}>
            <div className="fr-input-group">
              <label className="fr-label" htmlFor="email">
                Adresse e-mail
                <span className="fr-hint-text">
                  L&apos;adresse e-mail de votre{" "}
                  {profileType === "entreprise"
                    ? "entreprise"
                    : "établissement"}
                </span>
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
                    Nom de{" "}
                    {profileType === "entreprise"
                      ? "l'entreprise"
                      : "l'établissement"}
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

                {profileType === "entreprise" ? (
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
                        Secteur d&apos;activité
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
                        <option value="batiment">
                          Bâtiment et travaux publics
                        </option>
                        <option value="commerce">Commerce et vente</option>
                        <option value="services">Services</option>
                        <option value="transport">
                          Transport et logistique
                        </option>
                        <option value="tourisme">Tourisme et hôtellerie</option>
                        <option value="sante">Santé et social</option>
                        <option value="numerique">
                          Numérique et informatique
                        </option>
                        <option value="artisanat">Artisanat</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <div className="fr-input-group">
                    <label className="fr-label" htmlFor="profil.uai">
                      Code UAI
                      <span className="fr-hint-text">
                        Unité Administrative Immatriculée de votre établissement
                      </span>
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

            <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--center fr-mt-4w">
              <div className="fr-col-auto">
                <button
                  type="button"
                  className="fr-btn fr-btn--tertiary"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
                </button>
              </div>
              <div className="fr-col-auto">
                <button
                  type="submit"
                  className="fr-btn fr-btn--icon-left fr-icon-check-line"
                >
                  {isLogin ? "Se connecter" : "S'inscrire"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

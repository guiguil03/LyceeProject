"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import authService from "@/services/authService";

export default function LoginPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<"entreprise" | "lycee" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUserTypeSelect = (type: "entreprise" | "lycee") => {
    setUserType(type);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Appel du service d'authentification
      const response = await authService.login({ email, password });

      if (response.success) {
        // Redirection selon le rôle utilisateur
        if (response.data.user.role === "entreprise") {
          router.push("/search");
        } else if (response.data.user.role === "rbde") {
          router.push("/lycee/dashboard");
        } else {
          router.push("/");
        }
      }
    } catch (error: any) {
      setError(error.message || "Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    if (userType === "entreprise") {
      router.push("/register/entreprise");
    } else if (userType === "lycee") {
      router.push("/register/lycee");
    }
  };

  return (
    <div className="fr-container fr-py-8w">
      <div className="fr-grid-row fr-grid-row--center">
        <div className="fr-col-12 fr-col-md-8 fr-col-lg-6">
          {/* En-tête */}
          <div className="fr-mb-6w fr-text--center">
            <h1 className="fr-h1">Connexion à LycéeConnect</h1>
            <p className="fr-text--lead">
              Connectez-vous pour accéder à votre espace personnel
            </p>
          </div>

          {/* Sélection du type d'utilisateur */}
          {!userType && (
            <div className="fr-mb-6w">
              <fieldset className="fr-fieldset">
                <legend className="fr-fieldset__legend fr-text--regular">
                  <h2 className="fr-h3">Quel est votre profil ?</h2>
                </legend>

                <div className="fr-grid-row fr-grid-row--gutters">
                  <div className="fr-col-12 fr-col-md-6">
                    <div
                      className="fr-card fr-card--horizontal fr-card--no-arrow fr-enlarge-link"
                      onClick={() => handleUserTypeSelect("entreprise")}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="fr-card__body">
                        <div className="fr-card__content">
                          <h3 className="fr-card__title">
                            <span
                              className="fr-icon-building-line fr-mr-1w"
                              aria-hidden="true"
                            ></span>
                            Entreprise
                          </h3>
                          <p className="fr-card__desc">
                            Je recherche des lycées partenaires pour
                            l'alternance et les stages
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="fr-col-12 fr-col-md-6">
                    <div
                      className="fr-card fr-card--horizontal fr-card--no-arrow fr-enlarge-link"
                      onClick={() => handleUserTypeSelect("lycee")}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="fr-card__body">
                        <div className="fr-card__content">
                          <h3 className="fr-card__title">
                            <span
                              className="fr-icon-book-2-line fr-mr-1w"
                              aria-hidden="true"
                            ></span>
                            Lycée professionnel
                          </h3>
                          <p className="fr-card__desc">
                            Je souhaite valoriser mon établissement et gérer les
                            demandes
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
          )}

          {/* Formulaire de connexion */}
          {userType && (
            <div className="fr-card fr-card--no-arrow">
              <div className="fr-card__body">
                <div className="fr-card__content">
                  {/* Retour à la sélection */}
                  <div className="fr-mb-4w">
                    <button
                      type="button"
                      className="fr-btn fr-btn--secondary fr-btn--sm fr-btn--icon-left fr-icon-arrow-left-line"
                      onClick={() => setUserType(null)}
                    >
                      Changer de profil
                    </button>
                  </div>

                  <h3 className="fr-h3 fr-mb-4w">
                    <span
                      className={`fr-icon-${
                        userType === "entreprise" ? "building" : "book-2"
                      }-line fr-mr-1w`}
                      aria-hidden="true"
                    ></span>
                    Connexion{" "}
                    {userType === "entreprise" ? "Entreprise" : "Lycée"}
                  </h3>

                  {error && (
                    <div className="fr-alert fr-alert--error fr-alert--sm fr-mb-4w">
                      <p>{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="fr-input-group">
                      <label className="fr-label" htmlFor="email">
                        Adresse email
                      </label>
                      <input
                        className="fr-input"
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder={
                          userType === "entreprise"
                            ? "contact@monentreprise.fr"
                            : "rbde@lycee.fr"
                        }
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="fr-btns-group fr-btns-group--right fr-mt-4w">
                      <button
                        type="submit"
                        className="fr-btn"
                        disabled={isLoading}
                      >
                        {isLoading ? "Connexion..." : "Se connecter"}
                      </button>
                    </div>
                  </form>

                  <hr className="fr-hr fr-my-4w" />

                  <div className="fr-text--center">
                    <p className="fr-text--sm fr-mb-2w">
                      Pas encore de compte ?
                    </p>
                    <button
                      type="button"
                      className="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-user-add-line"
                      onClick={handleRegister}
                    >
                      Créer un compte{" "}
                      {userType === "entreprise" ? "entreprise" : "lycée"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Aide */}
          <div className="fr-mt-6w">
            <div className="fr-callout">
              <h4 className="fr-callout__title">Besoin d'aide ?</h4>
              <p>
                Pour toute question concernant votre connexion, contactez le
                support technique à l'adresse{" "}
                <a href="mailto:support@lyceeconnect.fr">
                  support@lyceeconnect.fr
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

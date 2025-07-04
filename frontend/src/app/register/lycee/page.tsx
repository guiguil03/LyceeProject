"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/services/api";

export default function RegisterLyceePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Tentative d'inscription lycée avec:", formData);

      // Appel direct à l'API avec les bonnes données
      const response = await fetch(`${API_BASE_URL}/auth/register/lycee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rbdeEmail: formData.email,
          password: formData.password,
          full_name: formData.full_name,
        }),
      });

      const data = await response.json();
      console.log("Réponse du serveur:", data);

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Erreur lors de l'inscription"
        );
      }

      if (data.success) {
        console.log(
          "Inscription lycée réussie, redirection vers /lycee/dashboard"
        );

        // Stocker le token et l'utilisateur
        if (data.data.token) {
          localStorage.setItem("lyceeconnect_token", data.data.token);
          localStorage.setItem(
            "lyceeconnect_user",
            JSON.stringify(data.data.user)
          );
        }

        router.push("/lycee/dashboard");
      }
    } catch (error: any) {
      console.error("Erreur lors de l'inscription lycée:", error);
      setError(error.message || "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fr-container fr-py-8w">
      <div className="fr-grid-row fr-grid-row--center">
        <div className="fr-col-12 fr-col-md-6">
          <h1 className="fr-h1 fr-mb-4w">Inscription Lycée (RBDE)</h1>
          <p className="fr-text--sm fr-mb-4w">
            Créez votre compte RBDE pour représenter votre établissement
          </p>

          {error && (
            <div className="fr-alert fr-alert--error fr-mb-4w">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="fr-card fr-card--no-arrow">
            <div className="fr-card__body">
              <div className="fr-input-group">
                <label className="fr-label" htmlFor="full_name">
                  Nom complet du RBDE *
                </label>
                <input
                  className="fr-input"
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Prénom Nom"
                  required
                />
                <p className="fr-hint-text">
                  Prénom et nom du Responsable de la Bourse aux Entreprises
                </p>
              </div>

              <div className="fr-input-group">
                <label className="fr-label" htmlFor="email">
                  Email professionnel *
                </label>
                <input
                  className="fr-input"
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="rbde@lycee.fr"
                  required
                />
                <p className="fr-hint-text">
                  Votre adresse email professionnelle
                </p>
              </div>

              <div className="fr-input-group">
                <label className="fr-label" htmlFor="password">
                  Mot de passe *
                </label>
                <input
                  className="fr-input"
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={8}
                  required
                />
                <p className="fr-hint-text">Au moins 8 caractères</p>
              </div>

              <div className="fr-input-group">
                <label className="fr-label" htmlFor="confirmPassword">
                  Confirmer le mot de passe *
                </label>
                <input
                  className="fr-input"
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="fr-notice fr-notice--info fr-mt-4w">
                <div className="fr-container">
                  <div className="fr-notice__body">
                    <p className="fr-notice__title">
                      Informations établissement
                    </p>
                    <p className="fr-text--sm">
                      Après votre inscription, vous pourrez compléter le profil
                      de votre lycée avec les formations, plateaux techniques et
                      autres informations détaillées.
                    </p>
                  </div>
                </div>
              </div>

              <div className="fr-btns-group fr-btns-group--right fr-mt-4w">
                <button
                  type="button"
                  className="fr-btn fr-btn--secondary fr-mr-2w"
                  onClick={() => router.push("/login")}
                >
                  Retour
                </button>
                <button type="submit" className="fr-btn" disabled={isLoading}>
                  {isLoading
                    ? "Inscription en cours..."
                    : "Créer mon compte RBDE"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

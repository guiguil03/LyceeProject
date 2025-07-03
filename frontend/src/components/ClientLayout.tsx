'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Navbar from './Navbar';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="fr-container fr-py-6w">
        <div className="fr-grid-row fr-grid-row--center">
          <div className="fr-col-12 fr-col-md-6">
            <div className="fr-text--center">
              <span className="fr-icon-refresh-line fr-icon--lg" aria-hidden="true"></span>
              <p>Chargement...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="fr-header">
        <div className="fr-header__body">
          <div className="fr-container">
            <div className="fr-header__body-row">
              <div className="fr-header__brand fr-enlarge-link">
                <div className="fr-header__brand-top">
                  <div className="fr-header__logo">
                    <p className="fr-logo">
                      République
                      <br />
                      Française
                    </p>
                  </div>
                  <div className="fr-header__operator">
                    <img
                      className="fr-responsive-img"
                      style={{ maxWidth: '3.5rem' }}
                      src="/favicon.ico"
                      alt="Logo"
                    />
                  </div>
                </div>
                <div className="fr-header__service">
                  <Link href="/" title="Accueil - LycéeConnect">
                    <p className="fr-header__service-title">LycéeConnect</p>
                  </Link>
                  <p className="fr-header__service-tagline">
                    Plateforme de mise en relation lycées-entreprises
                  </p>
                </div>
              </div>
              <div className="fr-header__tools">
                <Navbar 
                  isAuthenticated={isAuthenticated} 
                  userType={user?.type}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main role="main">
        {children}
      </main>

      <footer className="fr-footer" role="contentinfo">
        <div className="fr-container">
          <div className="fr-footer__body">
            <div className="fr-footer__brand fr-enlarge-link">
              <div className="fr-footer__brand-link">
                <p className="fr-logo" title="République française">
                  République
                  <br />
                  Française
                </p>
              </div>
            </div>
            <div className="fr-footer__content">
              <p className="fr-footer__content-desc">
                LycéeConnect facilite les partenariats entre lycées professionnels et entreprises 
                pour l'insertion professionnelle des jeunes.
              </p>
              <ul className="fr-footer__content-list">
                <li className="fr-footer__content-item">
                  <a className="fr-footer__content-link" href="/mentions-legales">
                    Mentions légales
                  </a>
                </li>
                <li className="fr-footer__content-item">
                  <a className="fr-footer__content-link" href="/donnees-personnelles">
                    Données personnelles
                  </a>
                </li>
                <li className="fr-footer__content-item">
                  <a className="fr-footer__content-link" href="/accessibilite">
                    Accessibilité
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="fr-footer__bottom">
            <ul className="fr-footer__bottom-list">
              <li className="fr-footer__bottom-item">
                <span className="fr-footer__bottom-link">
                  © République Française 2024
                </span>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
} 
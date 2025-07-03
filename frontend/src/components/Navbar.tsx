'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  isAuthenticated?: boolean;
  userType?: 'entreprise' | 'lycee';
}

export default function Navbar({ isAuthenticated = false, userType }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    // TODO: Implémenter la déconnexion
    router.push('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="fr-header__navbar">
      {!isAuthenticated ? (
        <div className="fr-btns-group">
          <Link 
            href="/search"
            className="fr-btn fr-btn--tertiary fr-btn--sm fr-btn--icon-left fr-icon-search-line"
            title="Rechercher"
          >
            Rechercher
          </Link>
          <Link
            href="/"
            className="fr-btn fr-btn--secondary fr-btn--sm fr-btn--icon-left fr-icon-account-line"
            title="Se connecter"
          >
            Connexion
          </Link>
        </div>
      ) : (
        <div className="fr-nav">
          <button
            className="fr-btn fr-btn--sm fr-btn--icon-left fr-icon-menu-line"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-controls="header-navigation"
            title="Menu principal"
          >
            Menu
          </button>
          
          {isMenuOpen && (
            <nav 
              className="fr-nav__list" 
              id="header-navigation"
              style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                background: 'white',
                border: '1px solid #e5e5e5',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                zIndex: 1000,
                minWidth: '200px',
                padding: '0.5rem 0'
              }}
            >
              <ul className="fr-nav__item" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                <li>
                  <Link 
                    href="/dashboard"
                    className="fr-nav__link fr-btn--sm"
                    style={{ 
                      display: 'block', 
                      padding: '0.5rem 1rem', 
                      textDecoration: 'none',
                      color: '#000091'
                    }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="fr-icon-dashboard-line fr-mr-1w" aria-hidden="true"></span>
                    Tableau de bord
                  </Link>
                </li>
                
                {userType === 'entreprise' && (
                  <>
                    <li>
                      <Link 
                        href="/search"
                        className="fr-nav__link fr-btn--sm"
                        style={{ 
                          display: 'block', 
                          padding: '0.5rem 1rem', 
                          textDecoration: 'none',
                          color: '#000091'
                        }}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="fr-icon-search-line fr-mr-1w" aria-hidden="true"></span>
                        Chercher des lycées
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/demandes"
                        className="fr-nav__link fr-btn--sm"
                        style={{ 
                          display: 'block', 
                          padding: '0.5rem 1rem', 
                          textDecoration: 'none',
                          color: '#000091'
                        }}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="fr-icon-file-text-line fr-mr-1w" aria-hidden="true"></span>
                        Mes demandes
                      </Link>
                    </li>
                  </>
                )}
                
                {userType === 'lycee' && (
                  <>
                    <li>
                      <Link 
                        href="/lycee"
                        className="fr-nav__link fr-btn--sm"
                        style={{ 
                          display: 'block', 
                          padding: '0.5rem 1rem', 
                          textDecoration: 'none',
                          color: '#000091'
                        }}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="fr-icon-school-line fr-mr-1w" aria-hidden="true"></span>
                        Mon lycée
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/carte-lycees"
                        className="fr-nav__link fr-btn--sm"
                        style={{ 
                          display: 'block', 
                          padding: '0.5rem 1rem', 
                          textDecoration: 'none',
                          color: '#000091'
                        }}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="fr-icon-map-pin-2-line fr-mr-1w" aria-hidden="true"></span>
                        Carte des lycées
                      </Link>
                    </li>
                  </>
                )}
                
                <li style={{ borderTop: '1px solid #e5e5e5', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                  <button 
                    onClick={handleLogout}
                    className="fr-nav__link fr-btn--sm"
                    style={{ 
                      display: 'block', 
                      padding: '0.5rem 1rem', 
                      textDecoration: 'none',
                      color: '#ce0500',
                      border: 'none',
                      background: 'transparent',
                      width: '100%',
                      textAlign: 'left'
                    }}
                  >
                    <span className="fr-icon-logout-box-r-line fr-mr-1w" aria-hidden="true"></span>
                    Se déconnecter
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
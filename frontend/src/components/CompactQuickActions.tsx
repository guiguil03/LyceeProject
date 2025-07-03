'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function CompactQuickActions() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  const navigateTo = (path: string) => {
    router.push(path);
  };

  // Actions essentielles selon le type d'utilisateur
  const getEssentialActions = () => {
    const commonActions = [
      {
        id: 'home',
        label: 'Accueil',
        icon: 'fr-icon-home-4-line',
        path: '/'
      },
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'fr-icon-dashboard-line',
        path: '/dashboard'
      }
    ];

    if (user.type === 'entreprise') {
      return [
        ...commonActions,
        {
          id: 'create-demande',
          label: 'Nouvelle demande',
          icon: 'fr-icon-add-line',
          path: '/demandes'
        },
        {
          id: 'search',
          label: 'Rechercher lycées',
          icon: 'fr-icon-search-line',
          path: '/search'
        },
        {
          id: 'mes-demandes',
          label: 'Mes demandes',
          icon: 'fr-icon-file-text-line',
          path: '/demandes'
        }
      ];
    } else {
      // Pour les lycées
      return [
        ...commonActions,
        {
          id: 'mon-lycee',
          label: 'Mon lycée',
          icon: 'fr-icon-school-line',
          path: '/lycee'
        },
        {
          id: 'profil-lycee',
          label: 'Gérer mon profil',
          icon: 'fr-icon-settings-5-line',
          path: '/lycee/profil'
        },
        {
          id: 'demandes-recues',
          label: 'Demandes reçues',
          icon: 'fr-icon-mail-line',
          path: '/demandes'
        }
      ];
    }
  };

  const essentialActions = getEssentialActions();

  return (
    <div 
      className="fr-container-fluid" 
      style={{ 
        backgroundColor: '#f9f8f6', 
        borderBottom: '1px solid #e5e5e5',
        padding: '0.5rem 0'
      }}
    >
      <div className="fr-container">
        <div className="fr-grid-row fr-grid-row--middle">
          <div className="fr-col-auto fr-mr-2w">
            <span className="fr-text--xs fr-text--mention-grey">
              Actions rapides :
            </span>
          </div>
          <div className="fr-col">
            <div className="fr-btns-group fr-btns-group--sm">
              {essentialActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => navigateTo(action.path)}
                  className={`fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-btn--icon-left ${action.icon}`}
                  title={action.label}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
          <div className="fr-col-auto">
            <span className="fr-text--xs fr-text--mention-grey">
              {user.name} ({user.type === 'entreprise' ? 'Entreprise' : 'Lycée'})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 
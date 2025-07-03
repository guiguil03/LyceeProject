'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function CompactQuickActions() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isAuthenticated || !user) {
    return null;
  }

  const navigateTo = (path: string) => {
    router.push(path);
  };

  // Actions essentielles selon le type d'utilisateur
  const getEssentialActions = () => {
    if (user.type === 'entreprise') {
      return [
        {
          id: 'dashboard',
          label: 'Tableau de bord',
          shortLabel: 'Dashboard',
          icon: 'fr-icon-dashboard-line',
          path: '/dashboard',
          description: 'Accédez à votre tableau de bord personnel',
          color: 'primary'
        },
        {
          id: 'create-demande',
          label: 'Nouvelle demande',
          shortLabel: 'Créer',
          icon: 'fr-icon-add-line',
          path: '/demandes?action=create',
          description: 'Créer une nouvelle demande de partenariat',
          color: 'success'
        },
        {
          id: 'search',
          label: 'Rechercher lycées',
          shortLabel: 'Recherche',
          icon: 'fr-icon-search-line',
          path: '/search',
          description: 'Rechercher des lycées professionnels',
          color: 'info'
        },
        {
          id: 'profils-lycees',
          label: 'Profils lycées',
          shortLabel: 'Profils',
          icon: 'fr-icon-building-line',
          path: '/lycees/profils',
          description: 'Consulter les profils des lycées',
          color: 'secondary'
        },
        {
          id: 'mes-demandes',
          label: 'Mes demandes',
          shortLabel: 'Demandes',
          icon: 'fr-icon-file-text-line',
          path: '/demandes',
          description: 'Gérer vos demandes de partenariat',
          color: 'warning'
        }
      ];
    } else {
      // Pour les lycées
      return [
        {
          id: 'dashboard',
          label: 'Tableau de bord',
          shortLabel: 'Dashboard',
          icon: 'fr-icon-dashboard-line',
          path: '/lycee/dashboard',
          description: 'Accédez à votre tableau de bord lycée',
          color: 'primary'
        },
        {
          id: 'mon-lycee',
          label: 'Mon établissement',
          shortLabel: 'Mon lycée',
          icon: 'fr-icon-school-line',
          path: '/lycee',
          description: 'Gérer les informations de votre lycée',
          color: 'info'
        },
        {
          id: 'profil-lycee',
          label: 'Gérer mon profil',
          shortLabel: 'Profil',
          icon: 'fr-icon-settings-5-line',
          path: '/lycee/profil',
          description: 'Modifier le profil de votre établissement',
          color: 'secondary'
        },
        {
          id: 'demandes-recues',
          label: 'Demandes reçues',
          shortLabel: 'Demandes',
          icon: 'fr-icon-mail-line',
          path: '/demandes',
                                     description: 'Consulter les demandes d&apos;entreprises',
          color: 'warning'
        }
      ];
    }
  };

  const essentialActions = getEssentialActions();

  const getButtonClass = (color: string) => {
    const colorClasses = {
      primary: 'fr-btn fr-btn--sm',
      secondary: 'fr-btn fr-btn--secondary fr-btn--sm',
      success: 'fr-btn fr-btn--sm',
      info: 'fr-btn fr-btn--tertiary fr-btn--sm',
      warning: 'fr-btn fr-btn--tertiary fr-btn--sm'
    };
    return colorClasses[color as keyof typeof colorClasses] || 'fr-btn fr-btn--tertiary fr-btn--sm';
  };

  return (
    <>
      {/* Version Desktop - Compacte avec labels */}
      <div 
        className="fr-container-fluid fr-hidden fr-unhidden-lg" 
        style={{ 
          backgroundColor: '#f9f8f6', 
          borderBottom: '1px solid #e5e5e5',
          padding: '0.75rem 0'
        }}
      >
        <div className="fr-container">
          <div className="fr-grid-row fr-grid-row--middle">
            <div className="fr-col-auto fr-mr-3w">
              <div className="fr-text--sm fr-text--bold">
                <span className="fr-icon-lightning-line fr-mr-1w" aria-hidden="true"></span>
                Actions rapides
              </div>
            </div>
            <div className="fr-col">
              <div className="fr-btns-group fr-btns-group--sm">
                {essentialActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => navigateTo(action.path)}
                    className={`${getButtonClass(action.color)} fr-btn--icon-left ${action.icon}`}
                    title={action.description}
                    style={{ minWidth: '120px' }}
                  >
                    <span className="fr-hidden fr-unhidden-md">{action.label}</span>
                    <span className="fr-hidden-md">{action.shortLabel}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="fr-col-auto">
              <div className="fr-text--sm fr-text--mention-grey">
                <span className="fr-icon-user-line fr-mr-1w" aria-hidden="true"></span>
                {user.name} 
                <span className="fr-badge fr-badge--sm fr-badge--blue-ecume fr-ml-1w">
                  {user.type === 'entreprise' ? 'Entreprise' : 'Lycée'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Version Mobile - Menu extensible avec descriptions */}
      <div 
        className="fr-container-fluid fr-hidden-lg" 
        style={{ 
          backgroundColor: '#f9f8f6', 
          borderBottom: '1px solid #e5e5e5',
          padding: '0.75rem 0'
        }}
      >
        <div className="fr-container">
          <div className="fr-grid-row fr-grid-row--middle">
            <div className="fr-col">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="fr-btn fr-btn--tertiary fr-btn--sm fr-btn--icon-left fr-icon-menu-line"
                aria-expanded={isExpanded}
                style={{ width: '100%', justifyContent: 'space-between' }}
              >
                <span>Menu d&apos;actions rapides</span>
                <span className={`fr-icon-${isExpanded ? 'arrow-up' : 'arrow-down'}-s-line`} aria-hidden="true"></span>
              </button>
            </div>
          </div>
          
          {isExpanded && (
            <div className="fr-mt-3w">
              <div className="fr-grid-row fr-grid-row--gutters">
                {essentialActions.map((action) => (
                  <div key={action.id} className="fr-col-6 fr-col-sm-4">
                    <button
                      onClick={() => {
                        navigateTo(action.path);
                        setIsExpanded(false);
                      }}
                      className="fr-btn fr-btn--tertiary fr-btn--sm"
                      style={{ 
                        width: '100%', 
                        height: 'auto',
                        padding: '1rem',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center'
                      }}
                      title={action.description}
                    >
                      <span 
                        className={`${action.icon} fr-mb-1w`} 
                        aria-hidden="true"
                        style={{ fontSize: '1.5rem', display: 'block' }}
                      ></span>
                      <span style={{ fontSize: '0.75rem', lineHeight: '1.2' }}>
                        {action.shortLabel}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="fr-mt-3w fr-pt-2w" style={{ borderTop: '1px solid #e5e5e5' }}>
                <div className="fr-text--sm fr-text--center fr-text--mention-grey">
                  <span className="fr-icon-user-line fr-mr-1w" aria-hidden="true"></span>
                  Connecté : {user.name} 
                  <span className="fr-badge fr-badge--sm fr-badge--blue-ecume fr-ml-1w">
                    {user.type === 'entreprise' ? 'Entreprise' : 'Lycée'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Barre d'actions flottante pour les écrans très larges */}
      <div className="fr-hidden fr-unhidden-xl">
        <div 
          style={{
            position: 'fixed',
            top: '50%',
            right: '20px',
            transform: 'translateY(-50%)',
            zIndex: 1000,
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '1px solid #e5e5e5',
            padding: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {essentialActions.slice(0, 4).map((action) => (
              <button
                key={action.id}
                onClick={() => navigateTo(action.path)}
                className="fr-btn fr-btn--tertiary fr-btn--sm fr-btn--icon-only"
                title={`${action.label} - ${action.description}`}
                style={{ 
                  width: '48px', 
                  height: '48px',
                  position: 'relative'
                }}
              >
                <span className={action.icon} aria-hidden="true"></span>
                <span className="fr-sr-only">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
} 
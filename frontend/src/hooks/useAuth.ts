'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  type: 'entreprise' | 'lycee';
  name: string;
  email: string;
  uai?: string; // Code UAI pour les lycées
  siret?: string; // SIRET pour les entreprises
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true
  });

  // Vérification du token au chargement
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        // Vérifier si le token n'est pas expiré
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        if (tokenData.exp > currentTime) {
          const user = JSON.parse(userData);
          setAuthState({
            isAuthenticated: true,
            user,
            isLoading: false
          });
          return;
        } else {
          // Token expiré, nettoyer
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
    
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false
    });
  };



  const login = async (email: string, password: string, type: 'entreprise' | 'lycee') => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Appel API réel
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, type }),
      });

      const data = await response.json();
      
      if (data.success) {
        const userData: User = {
          id: data.user.id,
          type: data.user.type,
          name: data.user.name,
          email: data.user.email,
          ...(data.user.uai && { uai: data.user.uai }),
          ...(data.user.siret && { siret: data.user.siret })
        };

        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        setAuthState({
          isAuthenticated: true,
          user: userData,
          isLoading: false
        });

        return { success: true };
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Erreur de connexion au serveur' };
    }
  };

  const register = async (email: string, password: string, name: string, type: 'entreprise' | 'lycee', additionalData?: { uai?: string; siret?: string }) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Appel API réel
      const requestBody: { email: string; password: string; name: string; type: string; uai?: string; siret?: string } = { email, password, name, type };
      if (additionalData?.uai) requestBody.uai = additionalData.uai;
      if (additionalData?.siret) requestBody.siret = additionalData.siret;

      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      if (data.success) {
        const userData: User = {
          id: data.user.id,
          type: data.user.type,
          name: data.user.name,
          email: data.user.email,
          ...(data.user.uai && { uai: data.user.uai }),
          ...(data.user.siret && { siret: data.user.siret })
        };

        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        setAuthState({
          isAuthenticated: true,
          user: userData,
          isLoading: false
        });

        return { success: true };
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Erreur de connexion au serveur' };
    }
  };



  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false
    });
  };

  // Vérifier si l'utilisateur a un token valide
  const getToken = (): string | null => {
    return localStorage.getItem('authToken');
  };

  return {
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    isLoading: authState.isLoading,
    login,
    register,
    logout,
    getToken,
    checkAuthStatus
  };
} 
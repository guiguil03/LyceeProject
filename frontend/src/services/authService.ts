import { API_BASE_URL } from './api';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'rbde' | 'entreprise';
  full_name?: string;
  lycee_id?: string;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

// Interfaces simplifiées - compatibilité avec l'ancien système
export interface RegisterEntrepriseData {
  nom?: string; // Optionnel pour compatibilité
  siret?: string; // Optionnel pour compatibilité
  secteur?: string; // Optionnel pour compatibilité
  adresse?: string; // Optionnel pour compatibilité
  email: string;
  password: string;
  contactNom?: string; // Optionnel pour compatibilité
  contactPrenom?: string; // Optionnel pour compatibilité
}

export interface RegisterLyceeData {
  nom?: string; // Optionnel pour compatibilité
  adresse?: string; // Optionnel pour compatibilité
  telephone?: string; // Optionnel pour compatibilité
  email?: string; // Optionnel pour compatibilité
  password: string;
  rbdeNom?: string; // Optionnel pour compatibilité
  rbdePrenom?: string; // Optionnel pour compatibilité
  rbdeEmail: string;
  description?: string; // Optionnel pour compatibilité
}

// Stockage du token
const TOKEN_KEY = 'lyceeconnect_token';
const USER_KEY = 'lyceeconnect_user';

// Utilitaires pour le stockage local
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const setUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = (): User | null => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

// Fonction utilitaire pour les appels API avec token
const apiCall = async (url: string, options: RequestInit = {}): Promise<any> => {
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Ajouter les headers personnalisés s'ils existent
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log('🔄 Appel API vers:', `${API_BASE_URL}${url}`);
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('❌ Erreur API:', data);
    throw new Error(data.message || data.error || 'Erreur réseau');
  }

  return data;
};

// Services d'authentification
export const authService = {
  // Connexion
  login: async (loginData: LoginData): Promise<AuthResponse> => {
    try {
      console.log('🔄 Tentative de connexion pour:', loginData.email);
      
      const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginData),
      });

      console.log('✅ Connexion réussie:', data);

      // Stocker le token et l'utilisateur
      if (data.success && data.data.token) {
        setToken(data.data.token);
        setUser(data.data.user);
      }

      return data;
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      throw error;
    }
  },

  // Inscription entreprise
  registerEntreprise: async (registerData: RegisterEntrepriseData): Promise<AuthResponse> => {
    try {
      console.log('🔄 Tentative d\'inscription entreprise pour:', registerData.email);
      
      const data = await apiCall('/auth/register/entreprise', {
        method: 'POST',
        body: JSON.stringify(registerData),
      });

      console.log('✅ Inscription entreprise réussie:', data);

      // Stocker le token et l'utilisateur
      if (data.success && data.data.token) {
        setToken(data.data.token);
        setUser(data.data.user);
      }

      return data;
    } catch (error) {
      console.error('❌ Erreur d\'inscription entreprise:', error);
      throw error;
    }
  },

  // Inscription lycée
  registerLycee: async (registerData: RegisterLyceeData): Promise<AuthResponse> => {
    try {
      console.log('🔄 Tentative d\'inscription lycée pour:', registerData.rbdeEmail);
      
      const data = await apiCall('/auth/register/lycee', {
        method: 'POST',
        body: JSON.stringify(registerData),
      });

      console.log('✅ Inscription lycée réussie:', data);

      // Stocker le token et l'utilisateur
      if (data.success && data.data.token) {
        setToken(data.data.token);
        setUser(data.data.user);
      }

      return data;
    } catch (error) {
      console.error('❌ Erreur d\'inscription lycée:', error);
      throw error;
    }
  },

  // Récupérer le profil utilisateur
  getProfile: async (): Promise<any> => {
    try {
      return await apiCall('/auth/profile');
    } catch (error) {
      console.error('❌ Erreur de récupération du profil:', error);
      throw error;
    }
  },

  // Vérifier si le token est valide
  verifyToken: async (): Promise<boolean> => {
    try {
      await apiCall('/auth/verify');
      return true;
    } catch (error) {
      // Token invalide, supprimer les données stockées
      removeToken();
      return false;
    }
  },

  // Déconnexion
  logout: async (): Promise<void> => {
    try {
      await apiCall('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.warn('❌ Erreur lors de la déconnexion côté serveur:', error);
    } finally {
      // Toujours supprimer les données locales
      removeToken();
    }
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: (): boolean => {
    const token = getToken();
    const user = getUser();
    return !!(token && user);
  },

  // Obtenir l'utilisateur actuel
  getCurrentUser: (): User | null => {
    return getUser();
  },

  // Vérifier le rôle de l'utilisateur
  hasRole: (role: string): boolean => {
    const user = getUser();
    return user?.role === role;
  },

  // Vérifier si l'utilisateur est une entreprise
  isEntreprise: (): boolean => {
    return authService.hasRole('entreprise');
  },

  // Vérifier si l'utilisateur est un RBDE
  isRBDE: (): boolean => {
    return authService.hasRole('rbde');
  },

  // Vérifier si l'utilisateur est admin
  isAdmin: (): boolean => {
    return authService.hasRole('admin');
  }
};

export default authService; 
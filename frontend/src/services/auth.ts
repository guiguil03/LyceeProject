// Service d'authentification
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface User {
  id: string;
  email: string;
  role: 'USER' | 'LYCEE_ADMIN' | 'ENTREPRISE_ADMIN' | 'SUPER_ADMIN';
  full_name?: string;
  lycee_id?: string;
  entreprise_id?: string;
  is_active: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  expires_in: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: 'LYCEE_ADMIN' | 'ENTREPRISE_ADMIN';
  full_name?: string;
  lycee_id?: string;
  entreprise_id?: string;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    // Récupérer le token depuis le localStorage au démarrage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      if (userData) {
        try {
          this.user = JSON.parse(userData);
        } catch (e) {
          console.error('Erreur parsing user data:', e);
          this.clearAuth();
        }
      }
    }
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur de connexion');
      }

      const data: LoginResponse = await response.json();
      
      // Stocker le token et les données utilisateur
      this.token = data.token;
      this.user = data.user;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Erreur login:', error);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de l\'inscription');
      }

      const data: LoginResponse = await response.json();
      
      // Stocker le token et les données utilisateur
      this.token = data.token;
      this.user = data.user;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Erreur registration:', error);
      throw error;
    }
  }

  logout(): void {
    this.token = null;
    this.user = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  getUserRole(): string | null {
    return this.user?.role || null;
  }

  isLyceeAdmin(): boolean {
    return this.user?.role === 'LYCEE_ADMIN';
  }

  isEntrepriseAdmin(): boolean {
    return this.user?.role === 'ENTREPRISE_ADMIN';
  }

  isSuperAdmin(): boolean {
    return this.user?.role === 'SUPER_ADMIN';
  }

  getAuthHeader(): Record<string, string> {
    if (this.token) {
      return {
        'Authorization': `Bearer ${this.token}`
      };
    }
    return {};
  }

  private clearAuth(): void {
    this.token = null;
    this.user = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  }

  // Vérifier si le token est encore valide
  async verifyToken(): Promise<boolean> {
    if (!this.token) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: 'GET',
        headers: {
          ...this.getAuthHeader(),
        },
      });

      if (!response.ok) {
        this.clearAuth();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur vérification token:', error);
      this.clearAuth();
      return false;
    }
  }
}

// Instance singleton
export const authService = new AuthService();
export default authService;

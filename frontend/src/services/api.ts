import { 
  MatchingCriteria, 
  MatchingResponse, 
  LyceeProfessionnel, 
  Entreprise, 
  Secteur,
  ApiResponse,
  ApiError 
} from '../types/api';

const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();
    
    if (!response.ok) {
      const error = data as ApiError;
      throw new Error(error.message || error.error || 'Erreur API');
    }
    
    return data.data || data;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });
      
      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error(`Erreur API pour ${endpoint}:`, error);
      throw error;
    }
  }

  // ================================
  // MATCHING
  // ================================

  /**
   * Trouve des lycées professionnels correspondant aux critères d'une entreprise
   */
  async findMatchingLycees(criteria: MatchingCriteria): Promise<MatchingResponse> {
    return this.request<MatchingResponse>('/match/lycees', {
      method: 'POST',
      body: JSON.stringify(criteria),
    });
  }

  /**
   * Trouve des entreprises proches d'un lycée professionnel
   */
  async findEntreprisesForLycee(uai: string, distance: number = 50): Promise<{
    lycee: LyceeProfessionnel | null;
    entreprises: Entreprise[];
  }> {
    return this.request<{
      lycee: LyceeProfessionnel | null;
      entreprises: Entreprise[];
    }>(`/match/entreprises/${uai}?distance=${distance}`);
  }

  /**
   * Obtient des statistiques sur les possibilités de matching pour un secteur
   */
  async getMatchingStats(secteur: string, departement?: string): Promise<{
    nombreLycees: number;
    principalesVilles: string[];
    formationsDisponibles: string[];
  }> {
    const params = departement ? `?departement=${encodeURIComponent(departement)}` : '';
    return this.request<{
      nombreLycees: number;
      principalesVilles: string[];
      formationsDisponibles: string[];
    }>(`/match/stats/${secteur}${params}`);
  }

  // ================================
  // LYCÉES
  // ================================

  /**
   * Recherche de lycées professionnels selon des critères
   */
  async searchLycees(params: {
    commune?: string;
    departement?: string;
    region?: string;
    codePostal?: string;
    formation?: string;
    distance?: number;
    latitude?: number;
    longitude?: number;
  }): Promise<LyceeProfessionnel[]> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    return this.request<LyceeProfessionnel[]>(`/lycees/search?${searchParams.toString()}`);
  }

  /**
   * Recherche de lycées par secteur d'activité
   */
  async searchLyceesBySector(secteur: string, params?: {
    commune?: string;
    departement?: string;
    region?: string;
    codePostal?: string;
    distance?: number;
    latitude?: number;
    longitude?: number;
  }): Promise<LyceeProfessionnel[]> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<LyceeProfessionnel[]>(`/lycees/secteur/${secteur}${query}`);
  }

  /**
   * Récupère les détails d'un lycée par son UAI
   */
  async getLyceeByUAI(uai: string): Promise<LyceeProfessionnel> {
    return this.request<LyceeProfessionnel>(`/lycees/${uai}`);
  }

  // ================================
  // ENTREPRISES
  // ================================

  /**
   * Recherche d'entreprises selon des critères
   */
  async searchEntreprises(params: {
    siret?: string;
    siren?: string;
    denominationSociale?: string;
    commune?: string;
    departement?: string;
    codePostal?: string;
    secteurActivite?: string;
    codeAPE?: string;
  }): Promise<Entreprise[]> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    return this.request<Entreprise[]>(`/entreprises/search?${searchParams.toString()}`);
  }

  /**
   * Récupère les détails d'une entreprise par son SIRET
   */
  async getEntrepriseBySiret(siret: string): Promise<Entreprise> {
    return this.request<Entreprise>(`/entreprises/${siret}`);
  }

  // ================================
  // UTILITAIRES
  // ================================

  /**
   * Liste des secteurs d'activité supportés
   */
  async getSecteurs(): Promise<Secteur[]> {
    return this.request<Secteur[]>('/secteurs');
  }

  /**
   * Vérification de l'état de l'API
   */
  async healthCheck(): Promise<{ success: boolean; message: string; timestamp: string }> {
    return this.request<{ success: boolean; message: string; timestamp: string }>('/health');
  }

  // ================================
  // GÉOLOCALISATION
  // ================================

  /**
   * Obtient la position géographique de l'utilisateur
   */
  async getCurrentPosition(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('La géolocalisation n\'est pas supportée par ce navigateur'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(new Error(`Erreur de géolocalisation: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }
}

export default new ApiService(); 
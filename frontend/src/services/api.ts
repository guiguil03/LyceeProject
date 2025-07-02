// Service API pour les appels vers le backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface LyceeData {
  nom: string;
  ville: string;
  secteur: string;
  academie: string;
  formations: string[];
  contact: {
    telephone?: string;
    email?: string;
  };
}

export interface SearchCriteria {
  secteurActivite?: string;
  commune?: string;
  distanceMax?: number;
}

// Nouvelles interfaces pour les fonctionnalités BDD
export interface Demande {
  id: string;
  entreprise_id: string;
  titre: string;
  description?: string;
  type_partenariat?: string;
  statut: string;
  date_creation: string;
  entreprise_nom?: string;
  nb_lycees_assignes?: number;
}

export interface CreateDemandeRequest {
  entreprise_id: string;
  metier_id?: string;
  titre: string;
  description?: string;
  type_partenariat?: string;
  zone_geo?: string;
  nb_places?: number;
  date_debut_souhaitee?: string;
  date_fin_souhaitee?: string;
  priorite?: 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE';
}

export const api = {
  // Recherche de lycées (API externe)
  async searchLycees(criteria: SearchCriteria): Promise<LyceeData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/lycees/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(criteria),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Erreur lors de la recherche de lycées:', error);
      throw error;
    }
  },

  // Matching entre entreprises et lycées (API externe)
  async findMatching(criteria: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/matching`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(criteria),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors du matching:', error);
      throw error;
    }
  },

  // Obtenir les détails d'un lycée (API externe)
  async getLyceeDetails(id: string): Promise<LyceeData | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/lycees/${id}`);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
      throw error;
    }
  },

  // === NOUVELLES FONCTIONNALITÉS BASE DE DONNÉES ===

  // Synchronisation des données
  async syncLycees(searchParams: Record<string, unknown>) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/db/sync/lycees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur sync lycées:', error);
      throw error;
    }
  },

  async syncEntreprise(siret: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/db/sync/entreprise/${siret}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur sync entreprise:', error);
      throw error;
    }
  },

  // Gestion des demandes
  async createDemande(data: CreateDemandeRequest) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/db/demandes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': 'temp-user-id', // À remplacer par un vrai système d'auth
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur création demande:', error);
      throw error;
    }
  },

  async getDemandes(filters?: Record<string, unknown>) {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/api/db/demandes?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur récupération demandes:', error);
      throw error;
    }
  },

  async getDemandeById(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/db/demandes/${id}`);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur récupération demande:', error);
      throw error;
    }
  },

  // Lycées en base de données
  async getLyceesFromDB(filters?: Record<string, unknown>) {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/api/db/lycees?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur récupération lycées BDD:', error);
      throw error;
    }
  },

  // Référentiels
  async getRegions() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/db/regions`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur récupération régions:', error);
      throw error;
    }
  },

  async getDomaines() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/db/domaines`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur récupération domaines:', error);
      throw error;
    }
  },

  async getMetiers(domaineId?: string) {
    try {
      const params = domaineId ? `?domaine_id=${domaineId}` : '';
      const response = await fetch(`${API_BASE_URL}/api/db/metiers${params}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur récupération métiers:', error);
      throw error;
    }
  },

  // Statistiques
  async getDemandeStats(filters?: Record<string, unknown>) {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/api/db/stats/demandes?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur récupération stats:', error);
      throw error;
    }
  }
};

export default api;
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

export const api = {
  // Recherche de lycées
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

  // Matching entre entreprises et lycées
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

  // Obtenir les détails d'un lycée
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
  }
};

export default api; 
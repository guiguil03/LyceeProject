// Types pour l'API backend

export interface Lycee {
  id: string;
  nom: string;
  ville: string;
  codePostal: string;
  secteur: 'public' | 'privé';
  academie: string;
  formations: Formation[];
  contact: {
    telephone?: string;
    email?: string;
    adresse?: string;
  };
  statistiques?: {
    nombreEleves?: number;
    nombreApprentis?: number;
    nombreEnseignants?: number;
    tauxReussite?: number;
  };
}

export interface Formation {
  id: string;
  nom: string;
  niveau: 'CAP' | 'Bac Pro' | 'BTS' | 'Licence Pro';
  secteurActivite: string;
  duree: number; // en années
  modalites: ('initiale' | 'apprentissage' | 'continue')[];
  nombrePlaces?: number;
}

export interface Entreprise {
  siret: string;
  nom: string;
  secteurActivite: string;
  localisation: {
    commune: string;
    departement: string;
    codePostal: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface MatchingCriteria {
  entreprise?: {
    secteurActivite?: string;
    siret?: string;
    localisation?: {
      commune?: string;
      departement?: string;
      codePostal?: string;
    };
  };
  preferences?: {
    distanceMax?: number;
    typeEtablissement?: 'public' | 'privé' | 'tous';
    niveauFormation?: Formation['niveau'][];
    nombreResultats?: number;
  };
}

export interface MatchingResult {
  lycee: Lycee;
  score: number;
  distance?: number;
  formationsCorrespondantes: Formation[];
  raisonMatch: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface SearchFilters {
  secteurActivite?: string;
  commune?: string;
  departement?: string;
  distanceMax?: number;
  typeEtablissement?: 'public' | 'privé' | 'tous';
  niveauFormation?: Formation['niveau'];
}

// Types pour les statistiques
export interface StatistiquesGenerales {
  nombreLycees: number;
  nombreFormations: number;
  nombrePartenaires: number;
  secteursPrincipaux: {
    nom: string;
    pourcentage: number;
  }[];
}

// Types pour le chat
export interface ChatMessage {
  id: string;
  contenu: string;
  auteur: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'error';
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  dateCreation: Date;
  dernierMessage: Date;
}

// Tous les types sont exportés individuellement ci-dessus 
export interface MatchingCriteria {
  entreprise?: {
    siret?: string;
    secteurActivite?: string;
    localisation?: {
      commune?: string;
      departement?: string;
      codePostal?: string;
      latitude?: number;
      longitude?: number;
    };
  };
  preferences?: {
    distanceMax?: number;
    typeEtablissement?: 'public' | 'prive' | 'tous';
    nombreResultats?: number;
  };
}

export interface LyceeProfessionnel {
  numero_uai: string;
  nom_etablissement: string;
  type_etablissement: string;
  statut_public_prive: string;
  libelle_commune: string;
  libelle_departement: string;
  code_postal_uai: string;
  adresse_1: string;
  telephone?: string;
  mail?: string;
  web?: string;
  latitude?: number;
  longitude?: number;
}

export interface Entreprise {
  siret: string;
  denominationSociale: string;
  secteurActivite: string;
  adresse: {
    commune: string;
    departement: string;
    codePostal: string;
  };
  coordonnees: {
    latitude: number;
    longitude: number;
  };
}

export interface MatchingResult {
  lycee: LyceeProfessionnel;
  score: number;
  distance?: number;
  motifs: string[];
}

export interface MatchingResponse {
  entreprise?: Entreprise;
  matches: MatchingResult[];
  criteresUtilises: string[];
  suggestions?: string[];
} 
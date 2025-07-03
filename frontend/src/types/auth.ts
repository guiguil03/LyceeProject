export interface User {
  id: string;
  email: string;
  nom: string;
  type: 'entreprise' | 'lycee';
  profil?: {
    entreprise?: {
      nom: string;
      siret: string;
      secteur: string;
      adresse: string;
    };
    lycee?: {
      nom: string;
      uai: string;
      adresse: string;
      formations: string[]; 
    };
  };
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, type: 'entreprise' | 'lycee') => Promise<boolean>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<boolean>;
}

export interface RegisterData {
  email: string;
  password: string;
  nom: string;
  type: 'entreprise' | 'lycee';
  profil: {
    nom: string;
    adresse: string;
    siret?: string;
    secteur?: string;
    uai?: string;
    formations?: string[];
  };
}

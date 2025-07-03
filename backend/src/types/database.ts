// Modèles TypeScript pour la base de données LyceeProject

export interface Region {
  id: string;
  nom: string;
  created_at: Date;
}

export interface Domaine {
  id: string;
  nom: string;
  description?: string;
  created_at: Date;
}

export interface Metier {
  id: string;
  nom: string;
  domaine_id: string;
  description?: string;
  created_at: Date;
  // Relations
  domaine?: Domaine;
}

export interface Lycee {
  id: string;
  nom: string;
  numero_uai?: string;
  type_etablissement?: string;
  statut_public_prive?: string;
  adresse: string;
  code_postal?: string;
  commune?: string;
  departement?: string;
  region_id?: string;
  latitude?: number;
  longitude?: number;
  telephone?: string;
  email?: string;
  site_web?: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
  // Relations
  region?: Region;
  formations?: Formation[];
  plateaux_techniques?: PlateauTechnique[];
}

export interface Formation {
  id: string;
  lycee_id: string;
  intitule: string;
  domaine_id?: string;
  metier_id?: string;
  niveau?: string; // CAP, BAC PRO, BTS, etc.
  modalite?: string; // temps plein, apprentissage, etc.
  duree_mois?: number;
  description?: string;
  created_at: Date;
  // Relations
  lycee?: Lycee;
  domaine?: Domaine;
  metier?: Metier;
}

export interface PlateauTechnique {
  id: string;
  lycee_id: string;
  nom: string;
  description?: string;
  capacite_etudiants?: number;
  equipements?: string[];
  image_url?: string;
  created_at: Date;
  // Relations
  lycee?: Lycee;
}

export interface Entreprise {
  id: string;
  nom: string;
  siret?: string;
  siren?: string;
  secteur_activite?: string;
  code_naf?: string;
  adresse?: string;
  code_postal?: string;
  commune?: string;
  departement?: string;
  latitude?: number;
  longitude?: number;
  telephone?: string;
  email?: string;
  site_web?: string;
  effectif?: string;
  created_at: Date;
  updated_at: Date;
  // Relations
  demandes?: Demande[];
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: 'USER' | 'LYCEE_ADMIN' | 'ENTREPRISE_ADMIN' | 'SUPER_ADMIN';
  full_name?: string;
  lycee_id?: string;
  entreprise_id?: string;
  is_active: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
  // Relations
  lycee?: Lycee;
  entreprise?: Entreprise;
}

export interface Demande {
  id: string;
  entreprise_id: string;
  metier_id?: string;
  titre: string;
  description?: string;
  type_partenariat?: string; // stage, apprentissage, visite, etc.
  zone_geo?: string;
  nb_places?: number;
  date_debut_souhaitee?: Date;
  date_fin_souhaitee?: Date;
  statut: 'EN_ATTENTE' | 'EN_COURS' | 'TRAITE' | 'ANNULE';
  priorite: 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE';
  date_creation: Date;
  date_modification: Date;
  // Relations
  entreprise?: Entreprise;
  metier?: Metier;
  lycees?: DemandeLycee[];
  actions?: Action[];
}

export interface DemandeLycee {
  id: string;
  demande_id: string;
  lycee_id: string;
  note?: string;
  statut_traitement: 'NOUVEAU' | 'EN_COURS' | 'ACCEPTE' | 'REFUSE' | 'EN_ATTENTE';
  score_matching?: number; // 0.00 à 1.00
  distance_km?: number;
  date_affectation: Date;
  date_reponse?: Date;
  user_traitement_id?: string;
  // Relations
  demande?: Demande;
  lycee?: Lycee;
  user_traitement?: User;
}

export interface Action {
  id: string;
  demande_id?: string;
  demande_lycee_id?: string;
  user_id: string;
  type_action: string; // CREATION, AFFECTATION, COMMENTAIRE, STATUT_CHANGE, etc.
  commentaire?: string;
  donnees_avant?: any; // JSON
  donnees_apres?: any; // JSON
  date_action: Date;
  // Relations
  demande?: Demande;
  demande_lycee?: DemandeLycee;
  user?: User;
}

// Types pour les requêtes API
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

export interface UpdateDemandeRequest {
  titre?: string;
  description?: string;
  type_partenariat?: string;
  zone_geo?: string;
  nb_places?: number;
  date_debut_souhaitee?: string;
  date_fin_souhaitee?: string;
  statut?: 'EN_ATTENTE' | 'EN_COURS' | 'TRAITE' | 'ANNULE';
  priorite?: 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE';
}

export interface CreateUserRequest {
  email: string;
  password: string;
  role: 'USER' | 'LYCEE_ADMIN' | 'ENTREPRISE_ADMIN';
  full_name?: string;
  lycee_id?: string;
  entreprise_id?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: 'USER' | 'LYCEE_ADMIN' | 'ENTREPRISE_ADMIN' | 'SUPER_ADMIN';
  full_name?: string;
  lycee_id?: string;
  entreprise_id?: string;
  // Pour les entreprises : utiliser le SIRET au lieu de l'ID
  siret?: string;
  nom_entreprise?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
  expires_in: number;
}

// Types pour les statistiques et rapports
export interface DemandeStats {
  total: number;
  en_attente: number;
  en_cours: number;
  traite: number;
  annule: number;
  par_mois: Array<{
    mois: string;
    count: number;
  }>;
}

export interface LyceeStats {
  total_lycees: number;
  lycees_actifs: number;
  formations_total: number;
  demandes_traitees: number;
  taux_reponse: number;
}

export interface MatchingStats {
  score_moyen: number;
  distance_moyenne: number;
  temps_traitement_moyen: number;
  taux_acceptation: number;
}

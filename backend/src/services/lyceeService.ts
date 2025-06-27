import axios from 'axios';

export interface LyceeProfessionnel {
  numero_uai: string;
  nom_etablissement: string;
  type_etablissement: string;
  statut_public_prive: string;
  adresse_1: string;
  code_postal_uai: string;
  localite_acheminement_uai: string;
  libelle_commune: string;
  libelle_departement: string;
  libelle_region: string;
  libelle_academie: string;
  latitude: number;
  longitude: number;
  telephone: string;
  fax: string;
  web: string;
  mail: string;
  formations: string[];
}

export interface LyceeSearchParams {
  commune?: string;
  departement?: string;
  region?: string;
  codePostal?: string;
  formation?: string;
  distance?: number;
  latitude?: number;
  longitude?: number;
}

class LyceeService {
  private readonly baseUrl = 'https://data.education.gouv.fr/api/records/1.0/search/';
  private readonly dataset = 'fr-en-annuaire_bde_lycees_pro';

  /**
   * Recherche des lycées professionnels selon les critères spécifiés
   */
  async searchLycees(params: LyceeSearchParams): Promise<LyceeProfessionnel[]> {
    try {
      const queryParams = new URLSearchParams({
        dataset: this.dataset,
        rows: '50',
        facet: ['code_postal_uai', 'localite_acheminement_uai', 'libelle_commune', 'libelle_departement', 'libelle_region', 'libelle_academie'].join(',')
      });

      // Construction des filtres avec le format correct de l'API
      if (params.commune) {
        queryParams.append('refine.libelle_commune', params.commune);
      }
      
      if (params.departement) {
        queryParams.append('refine.libelle_departement', params.departement);
      }
      
      if (params.region) {
        queryParams.append('refine.libelle_region', params.region);
      }
      
      if (params.codePostal) {
        queryParams.append('refine.code_postal_uai', params.codePostal);
      }

      // Recherche textuelle si une formation est spécifiée
      if (params.formation) {
        queryParams.append('q', params.formation);
      }

      // Recherche par géolocalisation si latitude/longitude fournies
      if (params.latitude && params.longitude && params.distance) {
        queryParams.append('geofilter.distance', `${params.latitude},${params.longitude},${params.distance * 1000}`); // distance en mètres
      }

      const url = `${this.baseUrl}?${queryParams.toString()}`;
      console.log('🔍 Recherche lycées avec URL:', url);
      
      const response = await axios.get(url);
      
      console.log('📊 Réponse API lycées:', {
        totalRecords: response.data.nhits || 0,
        recordsReturned: response.data.records?.length || 0,
        firstRecord: response.data.records?.[0]?.fields || null
      });
      
      return response.data.records.map((record: any) => this.formatLyceeData(record));
    } catch (error) {
      console.error('Erreur lors de la recherche des lycées:', error);
      throw new Error('Impossible de récupérer les données des lycées professionnels');
    }
  }

  /**
   * Récupère les détails d'un lycée par son UAI
   */
  async getLyceeByUAI(uai: string): Promise<LyceeProfessionnel | null> {
    try {
      const queryParams = new URLSearchParams({
        dataset: this.dataset
      });
      queryParams.append('refine.numero_uai', uai);

      const response = await axios.get(`${this.baseUrl}?${queryParams.toString()}`);
      
      if (response.data.records.length === 0) {
        return null;
      }

      return this.formatLyceeData(response.data.records[0]);
    } catch (error) {
      console.error('Erreur lors de la récupération du lycée:', error);
      return null;
    }
  }

  /**
   * Recherche des lycées par secteur d'activité (basé sur les formations)
   */
  async searchLyceesBySector(secteur: string, params?: Omit<LyceeSearchParams, 'formation'>): Promise<LyceeProfessionnel[]> {
    console.log('🎯 Recherche par secteur:', secteur);
    
    try {
      // Première tentative : recherche générale dans la zone géographique
      console.log('🔍 Étape 1: Recherche générale des lycées professionnels');
      const allLycees = await this.searchLycees(params || {});
      console.log('📍 Lycées trouvés dans la zone:', allLycees.length);
      
      if (allLycees.length === 0) {
        // Si aucun lycée dans la zone spécifique, essayer par département ou région
        console.log('🔍 Étape 2: Élargissement par département');
        let lyceesElargis: LyceeProfessionnel[] = [];
        
        if (params?.departement) {
          lyceesElargis = await this.searchLycees({ departement: params.departement });
          console.log(`🏢 Lycées trouvés dans le département ${params.departement}:`, lyceesElargis.length);
        }
        
        if (lyceesElargis.length === 0 && params?.commune) {
          // Essayer de chercher dans les départements voisins
          const departementsVoisins = this.getDepartementsVoisins(params.commune);
          for (const dept of departementsVoisins) {
            console.log(`🔍 Recherche dans département voisin: ${dept}`);
            const lyceesVoisins = await this.searchLycees({ departement: dept });
            lyceesElargis.push(...lyceesVoisins);
            if (lyceesElargis.length >= 10) break; // Limiter pour éviter trop de résultats
          }
        }
        
        return lyceesElargis.slice(0, 20);
      }
      
      // Mapping des secteurs vers les formations courantes
      const secteurFormations: { [key: string]: string[] } = {
        'informatique': ['informatique', 'numérique', 'système', 'réseau', 'développement', 'digital', 'sio', 'snir'],
        'commerce': ['commerce', 'vente', 'marketing', 'gestion', 'accueil', 'relation client'],
        'industrie': ['industriel', 'mécanique', 'électrique', 'maintenance', 'production', 'usinage'],
        'batiment': ['bâtiment', 'construction', 'travaux publics', 'génie civil', 'maçonnerie', 'menuiserie'],
        'restauration': ['restauration', 'hôtellerie', 'cuisine', 'service', 'tourisme', 'cshcr'],
        'transport': ['transport', 'logistique', 'conduite', 'automobile', 'maintenance véhicule'],
        'sante': ['santé', 'social', 'aide', 'soin', 'accompagnement', 'assp']
      };

      const motsClesSecteur = secteurFormations[secteur.toLowerCase()] || [secteur];
      console.log('🔎 Mots-clés recherchés:', motsClesSecteur);
      
      // Filtrer les lycées par secteur (recherche dans les noms et formations)
      const lyceesFilters = allLycees.filter(lycee => {
        const texteAAnalyser = [
          lycee.nom_etablissement,
          lycee.type_etablissement,
          ...lycee.formations
        ].join(' ').toLowerCase();
        
        return motsClesSecteur.some(motCle => 
          texteAAnalyser.includes(motCle.toLowerCase())
        );
      });
      
      console.log('✅ Lycées correspondant au secteur:', lyceesFilters.length);
      
      // Si pas de correspondance exacte, retourner tous les lycées de la zone
      if (lyceesFilters.length === 0) {
        console.log('⚠️ Aucune correspondance exacte, retour de tous les lycées de la zone');
        return allLycees;
      }
      
      return lyceesFilters;
      
    } catch (error) {
      console.error('Erreur lors de la recherche par secteur:', error);
      // En cas d'erreur, essayer une recherche générale
      try {
        console.log('🚨 Fallback: recherche générale sans filtres');
        return await this.searchLycees({});
      } catch (fallbackError) {
        console.error('Erreur du fallback:', fallbackError);
        return [];
      }
    }
  }

  /**
   * Formate les données reçues de l'API
   */
  private formatLyceeData(record: any): LyceeProfessionnel {
    const fields = record.fields;
    
    return {
      numero_uai: fields.numero_uai || '',
      nom_etablissement: fields.nom_etablissement || '',
      type_etablissement: fields.type_etablissement || '',
      statut_public_prive: fields.statut_public_prive || '',
      adresse_1: fields.adresse_1 || '',
      code_postal_uai: fields.code_postal_uai || '',
      localite_acheminement_uai: fields.localite_acheminement_uai || '',
      libelle_commune: fields.libelle_commune || '',
      libelle_departement: fields.libelle_departement || '',
      libelle_region: fields.libelle_region || '',
      libelle_academie: fields.libelle_academie || '',
      latitude: fields.latitude || 0,
      longitude: fields.longitude || 0,
      telephone: fields.telephone || '',
      fax: fields.fax || '',
      web: fields.web || '',
      mail: fields.mail || '',
      formations: this.extractFormations(fields)
    };
  }

  /**
   * Extrait les formations disponibles depuis les données
   */
  private extractFormations(fields: any): string[] {
    // Cette méthode peut être étendue selon la structure exacte des données
    const formations: string[] = [];
    
    // Recherche dans différents champs possibles
    const formationFields = ['formations', 'specialites', 'options', 'filiere'];
    
    formationFields.forEach(field => {
      if (fields[field]) {
        if (Array.isArray(fields[field])) {
          formations.push(...fields[field]);
        } else {
          formations.push(fields[field]);
        }
      }
    });

    return [...new Set(formations)]; // Suppression des doublons
  }

  /**
   * Retourne les départements voisins d'une commune pour élargir la recherche
   */
  private getDepartementsVoisins(commune: string): string[] {
    const departementsProches: { [key: string]: string[] } = {
      'Paris': ['Hauts-de-Seine', 'Seine-Saint-Denis', 'Val-de-Marne', 'Seine-et-Marne', 'Yvelines', 'Essonne', 'Val-d\'Oise'],
      'Meaux': ['Paris', 'Oise', 'Aisne', 'Marne'],
      'Melun': ['Paris', 'Essonne', 'Loiret', 'Yonne'],
      'Torcy': ['Paris', 'Seine-Saint-Denis', 'Val-de-Marne'],
      'Lyon': ['Rhône', 'Ain', 'Loire', 'Isère'],
      'Marseille': ['Bouches-du-Rhône', 'Var', 'Vaucluse'],
      'Toulouse': ['Haute-Garonne', 'Tarn', 'Gers', 'Ariège'],
      'Nantes': ['Loire-Atlantique', 'Maine-et-Loire', 'Vendée'],
      'Lille': ['Nord', 'Pas-de-Calais'],
      'Strasbourg': ['Bas-Rhin', 'Haut-Rhin'],
      'Bordeaux': ['Gironde', 'Dordogne', 'Lot-et-Garonne'],
      'Nice': ['Alpes-Maritimes', 'Var', 'Alpes-de-Haute-Provence']
    };

    return departementsProches[commune] || ['Seine-et-Marne', 'Hauts-de-Seine', 'Seine-Saint-Denis'];
  }
}

export default new LyceeService(); 
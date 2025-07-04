import axios from 'axios';

// Interface pour la réponse de l'API
interface ApiResponse {
  nhits: number;
  records: ApiRecord[];
}

interface ApiRecord {
  fields: any;
  geometry?: any;
  record_timestamp?: string;
}

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
  diplomes: string[];
  metiers: string[];
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
        rows: '1000', // Augmenté pour récupérer plus de lycées
        facet: ['code_postal_uai', 'localite_acheminement_uai', 'libelle_commune', 'libelle_departement', 'libelle_region', 'libelle_academie', 'secteur'].join(',')
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
      const apiData = response.data as ApiResponse;
      
      console.log('📊 Réponse API lycées:', {
        totalRecords: apiData.nhits || 0,
        recordsReturned: apiData.records?.length || 0,
        firstRecordFields: apiData.records?.[0]?.fields ? Object.keys(apiData.records[0].fields) : []
      });
      
      if (apiData.records && apiData.records.length > 0) {
        console.log('📋 Premier lycée exemple:', {
          uai: apiData.records[0].fields?.numero_uai,
          nom: apiData.records[0].fields?.appellation_officielle,
          commune: apiData.records[0].fields?.libelle_commune,
          hasDiplomes: !!apiData.records[0].fields?.diplomes_prepares,
          hasMetiers: !!apiData.records[0].fields?.metiers_prepares,
          hasPosition: !!apiData.records[0].fields?.position
        });
      }
      
      return apiData.records.map((record: ApiRecord) => this.formatLyceeData(record));
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
      const apiData = response.data as ApiResponse;
      
      if (apiData.records.length === 0) {
        return null;
      }

      return this.formatLyceeData(apiData.records[0]);
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
        'informatique': ['informatique', 'numérique', 'système', 'réseau', 'développement', 'digital', 'sio', 'snir', 'technologique', 'technique'],
        'commerce': ['commerce', 'vente', 'marketing', 'gestion', 'accueil', 'relation client', 'commercial', 'magasin', 'vendeur'],
        'industrie': ['industriel', 'mécanique', 'électrique', 'maintenance', 'production', 'usinage', 'technique'],
        'batiment': ['bâtiment', 'construction', 'travaux publics', 'génie civil', 'maçonnerie', 'menuiserie'],
        'restauration': ['restauration', 'hôtellerie', 'cuisine', 'service', 'tourisme', 'cshcr'],
        'transport': ['transport', 'logistique', 'conduite', 'automobile', 'maintenance véhicule'],
        'sante': ['santé', 'social', 'aide', 'soin', 'accompagnement', 'assp']
      };

      const motsClesSecteur = secteurFormations[secteur.toLowerCase()] || [secteur];
      console.log('🔎 Mots-clés recherchés:', motsClesSecteur);
      
      // Filtrer les lycées par secteur (recherche dans TOUS les champs riches)
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
    
    console.log('🔍 Données brutes disponibles pour', fields.numero_uai, ':', Object.keys(fields));
    
    return {
      numero_uai: fields.numero_uai || '',
      nom_etablissement: fields.appellation_officielle || fields.nom_etablissement || '',
      type_etablissement: fields.type_etablissement || '',
      statut_public_prive: this.formatStatut(fields.secteur),
      adresse_1: fields.adresse_uai || fields.adresse_1 || '',
      code_postal_uai: fields.code_postal_uai || '',
      localite_acheminement_uai: fields.localite_acheminement_uai || '',
      libelle_commune: fields.libelle_commune || '',
      libelle_departement: fields.libelle_departement || '',
      libelle_region: fields.libelle_region || '',
      libelle_academie: fields.libelle_academie || '',
      latitude: fields.position?.lat || fields.latitude || 0,
      longitude: fields.position?.lon || fields.longitude || 0,
      telephone: fields.telephone || '',
      fax: fields.fax || '',
      web: fields.web || '',
      mail: this.formatMail(fields.mail_bde),
      formations: this.extractFormations(fields),
      diplomes: this.extractDiplomes(fields),
      metiers: this.extractMetiers(fields)
    };
  }

  /**
   * Formate le statut public/privé
   */
  private formatStatut(secteur: string): string {
    if (!secteur) return '';
    return secteur === 'public' ? 'Public' : 'Privé';
  }

  /**
   * Formate l'email depuis le tableau mail_bde
   */
  private formatMail(mailBde: string[] | string): string {
    if (!mailBde) return '';
    if (Array.isArray(mailBde)) {
      return mailBde[0] || '';
    }
    return mailBde;
  }

  /**
   * Extrait SEULEMENT les diplômes (pas les métiers) depuis l'API
   */
  private extractFormations(fields: any): string[] {
    const formations: string[] = [];
    
    console.log('🔍 Extraction formations pour:', fields.appellation_officielle || fields.numero_uai);
    
    // SEULEMENT les diplômes préparés (séparés par |)
    if (fields.diplomes_prepares) {
      console.log('🎓 Diplômes bruts:', fields.diplomes_prepares.substring(0, 200) + (fields.diplomes_prepares.length > 200 ? '...' : ''));
      const diplomes = fields.diplomes_prepares.split('|')
        .map((d: string) => d.trim())
        .filter((d: string) => d.length > 0);
      formations.push(...diplomes);
      console.log('🎓 Diplômes extraits:', diplomes.length, 'diplômes');
    } else {
      console.log('❌ Pas de diplomes_prepares trouvé');
    }
    
    // Suppression des doublons et filtrage
    const formationsUniques = [...new Set(formations.filter(f => f && f.length > 0))];
    
    console.log('✅ Total diplômes uniques extraits:', formationsUniques.length);
    console.log('📋 Échantillon diplômes:', formationsUniques.slice(0, 3));

    return formationsUniques;
  }

     /**
    * Extrait les diplômes depuis les VRAIS champs de l'API
    */
   private extractDiplomes(fields: any): string[] {
     const diplomes: string[] = [];
     
     // Diplômes préparés (séparés par |)
     if (fields.diplomes_prepares) {
       const diplomesArray = fields.diplomes_prepares.split('|')
         .map((d: string) => d.trim())
         .filter((d: string) => d.length > 0);
       diplomes.push(...diplomesArray);
     }
     
     // Suppression des doublons et filtrage
     const diplomesUniques = [...new Set(diplomes.filter(d => d && d.length > 0))];
     
     return diplomesUniques;
   }

     /**
    * Extrait les métiers depuis les VRAIS champs de l'API
    */
   private extractMetiers(fields: any): string[] {
     const metiers: string[] = [];
     
     // Métiers préparés (séparés par |)
     if (fields.metiers_prepares) {
       const metiersArray = fields.metiers_prepares.split('|')
         .map((m: string) => m.trim())
         .filter((m: string) => m.length > 0);
       metiers.push(...metiersArray);
     }
     
     // Suppression des doublons et filtrage
     const metiersUniques = [...new Set(metiers.filter(m => m && m.length > 0))];
     
     return metiersUniques;
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
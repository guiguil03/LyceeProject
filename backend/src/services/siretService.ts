import axios from 'axios';

export interface Entreprise {
  siret: string;
  siren: string;
  denominationSociale: string;
  secteurActivite: string;
  adresse: {
    numeroVoie?: string;
    typeVoie?: string;
    libelleVoie?: string;
    commune: string;
    codePostal: string;
    departement: string;
  };
  coordonnees: {
    latitude?: number;
    longitude?: number;
  };
  dateCreation?: string;
  statutDiffusion: string;
  etatAdministratif: string;
}

export interface EntrepriseSearchParams {
  commune?: string;
  departement?: string;
  secteurActivite?: string;
  limite?: number;
  rayon?: number;
  latitude?: number;
  longitude?: number;
}

class SiretService {
  // API SIRENE officielle INSEE  
  private readonly BASE_URL = 'https://api.insee.fr/entreprises/sirene/V3.11';
  private readonly API_KEY = process.env.INSEE_API_KEY || '1f5d7399-a97a-39b4-b82c-183965acf1ac';

  // Base de données de test comme fallback si l'API échoue
  private readonly ENTREPRISES_TEST: { [key: string]: Entreprise } = {}
  
  /**
   * Récupère les informations d'une entreprise via son SIRET
   * Utilise l'API SIRENE officielle INSEE
   */
  async getEntrepriseBySiret(siret: string): Promise<Entreprise | null> {
    try {
      console.log('🔍 [API SIRENE INSEE] Recherche entreprise SIRET:', siret);
      
      // Nettoyage du SIRET
      const siretClean = siret.replace(/[\s-]/g, '');
      
      if (siretClean.length !== 14) {
        console.log('❌ SIRET invalide (doit contenir 14 chiffres):', siretClean);
        return null;
      }

      // 1. Tentative via API officielle INSEE
      try {
        console.log('🌐 Appel API INSEE officielle...');
        const entreprise = await this.getFromInseeAPI(siretClean);
        if (entreprise) {
          console.log('✅ Entreprise trouvée via API INSEE:', entreprise.denominationSociale);
          return entreprise;
        }
      } catch (error) {
        console.log('⚠️ API INSEE indisponible:', error instanceof Error ? error.message : 'Erreur inconnue');
      }

      // 2. Fallback: générer une entreprise de test
      console.log('🔧 Fallback: génération d\'une entreprise de test');

      // 3. Si rien trouvé, générer une entreprise de test basée sur le SIRET
      console.log('🔧 Génération d\'une entreprise de test pour:', siretClean);
      return this.generateTestEntreprise(siretClean);

    } catch (error) {
      console.error('❌ Erreur lors de la recherche SIRET:', error);
      // En cas d'erreur, générer une entreprise de test
      return this.generateTestEntreprise(siret);
    }
  }

  /**
   * Récupère les données via l'API officielle INSEE avec authentification
   */
  private async getFromInseeAPI(siret: string): Promise<Entreprise | null> {
    try {
      console.log('📡 Appel API INSEE:', `${this.BASE_URL}/siret/${siret}`);
      console.log('🔑 Token utilisé:', this.API_KEY.substring(0, 8) + '...');
      
      const response = await axios.get(`${this.BASE_URL}/siret/${siret}`, {
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Accept': 'application/json',
          'User-Agent': 'LyceeProject/1.0'
        },
        timeout: 10000
      });

      console.log('📡 Statut réponse API INSEE:', response.status);

      if (response.data && response.data.etablissement) {
        const etab = response.data.etablissement;
        const uniteLegale = etab.uniteLegale || {};
        
        // Récupération de l'activité principale depuis les périodes
        const activitePrincipale = etab.periodesEtablissement?.[0]?.activitePrincipaleEtablissement || 
                                  etab.uniteLegale?.activitePrincipaleUniteLegale;
        
        console.log('✅ Données INSEE reçues:', {
          siret: etab.siret,
          nom: uniteLegale.denominationUniteLegale,
          commune: etab.adresseEtablissement?.libelleCommuneEtablissement,
          codeNAF: activitePrincipale,
          etat: uniteLegale.etatAdministratifUniteLegale
        });

        const secteurActivite = this.getSecteurActiviteFromNaf(activitePrincipale);

        const adresse = {
          numeroVoie: etab.adresseEtablissement?.numeroVoieEtablissement || '',
          typeVoie: etab.adresseEtablissement?.typeVoieEtablissement || '',
          libelleVoie: etab.adresseEtablissement?.libelleVoieEtablissement || '',
          commune: etab.adresseEtablissement?.libelleCommuneEtablissement || '',
          codePostal: etab.adresseEtablissement?.codePostalEtablissement || '',
          departement: etab.adresseEtablissement?.libelleCommuneEtablissement || ''
        };

        const coordonnees = await this.getCoordinatesFromAddress(adresse);

        return {
          siret: etab.siret,
          siren: etab.siren,
          denominationSociale: uniteLegale.denominationUniteLegale || 
                              etab.denominationUsuelleEtablissement || 
                              `${uniteLegale.prenom1UniteLegale || ''} ${uniteLegale.nomUniteLegale || ''}`.trim() ||
                              `Établissement ${etab.siret}`,
          secteurActivite: secteurActivite,
          adresse: adresse,
          coordonnees: coordonnees,
          dateCreation: etab.dateCreationEtablissement || '',
          statutDiffusion: etab.statutDiffusionEtablissement || 'O',
          etatAdministratif: uniteLegale.etatAdministratifUniteLegale || 'A'
        };
      }

      console.log('❌ Aucun établissement trouvé dans la réponse API');
      return null;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Erreur API INSEE:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        
        if (error.response?.status === 404) {
          console.log('❌ SIRET non trouvé dans la base SIRENE INSEE');
          return null;
        } else if (error.response?.status === 401) {
          throw new Error('Token d\'authentification invalide ou expiré');
        } else if (error.response?.status === 429) {
          throw new Error('Limite de requêtes atteinte (quota dépassé)');
        } else if (error.response?.status === 403) {
          throw new Error('Accès interdit - Vérifiez vos droits');
        }
      }
      throw error;
    }
  }

  /**
   * Génère une entreprise de test basée sur le SIRET fourni
   */
  private generateTestEntreprise(siret: string): Entreprise {
    const siretClean = siret.replace(/[\s-]/g, '');
    
    // Secteurs possibles
    const secteurs = ['Informatique', 'Commerce', 'BTP', 'Transport', 'Industrie', 'Services'];
    const communes = [
      { nom: 'Paris', cp: '75001', dept: 'Paris', lat: 48.8566, lon: 2.3522 },
      { nom: 'Lyon', cp: '69001', dept: 'Rhône', lat: 45.7640, lon: 4.8357 },
      { nom: 'Marseille', cp: '13001', dept: 'Bouches-du-Rhône', lat: 43.2965, lon: 5.3698 },
      { nom: 'Toulouse', cp: '31000', dept: 'Haute-Garonne', lat: 43.6047, lon: 1.4442 },
      { nom: 'Nice', cp: '06000', dept: 'Alpes-Maritimes', lat: 43.7102, lon: 7.2620 }
    ];

    // Utilisation du SIRET pour générer des données cohérentes
    const hash = parseInt(siretClean.slice(-4), 10);
    const secteur = secteurs[hash % secteurs.length];
    const commune = communes[hash % communes.length];

    return {
      siret: siretClean,
      siren: siretClean.slice(0, 9),
      denominationSociale: `ENTREPRISE TEST ${siretClean.slice(-4)}`,
      secteurActivite: secteur,
      adresse: {
        numeroVoie: String((hash % 999) + 1),
        typeVoie: 'RUE',
        libelleVoie: 'DE LA DEMO',
        commune: commune.nom,
        codePostal: commune.cp,
        departement: commune.dept
      },
      coordonnees: {
        latitude: commune.lat + (Math.random() - 0.5) * 0.1,
        longitude: commune.lon + (Math.random() - 0.5) * 0.1
      },
      dateCreation: '2020-01-01',
      statutDiffusion: 'O',
      etatAdministratif: 'A'
    };
  }

  /**
   * Recherche d'entreprises par critères
   */
  async searchEntreprises(params: EntrepriseSearchParams): Promise<Entreprise[]> {
    console.log('🔍 Recherche entreprises avec critères:', params);
    
    // Pour l'instant, on génère des entreprises de test selon les critères
    const resultats: Entreprise[] = [];
    
    // Génération d'entreprises de test basées sur les critères
    for (let i = 0; i < (params.limite || 5); i++) {
      const testSiret = `${Date.now()}${i}`.padEnd(14, '0').substring(0, 14);
      const entreprise = this.generateTestEntreprise(testSiret);
      
      // Adapter les données selon les critères
      if (params.commune) {
        entreprise.adresse.commune = params.commune;
      }
      if (params.secteurActivite) {
        entreprise.secteurActivite = params.secteurActivite;
      }
      
      resultats.push(entreprise);
    }

    console.log(`✅ ${resultats.length} entreprises générées`);
    return resultats;
  }

  /**
   * Convertit un code NAF en secteur d'activité lisible
   */
  private getSecteurActiviteFromNaf(codeNaf: string): string {
    if (!codeNaf) return 'Non spécifié';
    
    console.log('🔍 Analyse code NAF:', codeNaf);
    
    // Mapping complet des codes NAF vers les secteurs d'activité
    const secteurs: { [key: string]: string } = {
      // Agriculture, sylviculture et pêche (01-03)
      '01': 'Agriculture',
      '02': 'Agriculture',
      '03': 'Agriculture',
      
      // Industries extractives (05-09)
      '05': 'Industrie',
      '06': 'Industrie',
      '07': 'Industrie',
      '08': 'Industrie',
      '09': 'Industrie',
      
      // Industries manufacturières (10-33)
      '10': 'Industrie alimentaire',
      '11': 'Industrie alimentaire',
      '12': 'Industrie',
      '13': 'Textile',
      '14': 'Textile',
      '15': 'Textile',
      '16': 'Industrie du bois',
      '17': 'Industrie',
      '18': 'Imprimerie',
      '19': 'Industrie chimique',
      '20': 'Industrie chimique',
      '21': 'Industrie pharmaceutique',
      '22': 'Industrie',
      '23': 'Industrie',
      '24': 'Métallurgie',
      '25': 'Métallurgie',
      '26': 'Informatique',
      '27': 'Industrie électrique',
      '28': 'Industrie mécanique',
      '29': 'Automobile',
      '30': 'Transport',
      '31': 'Industrie',
      '32': 'Industrie',
      '33': 'Industrie',
      
      // Production et distribution d'électricité, de gaz, de vapeur et d'air conditionné (35)
      '35': 'Énergie',
      
      // Production et distribution d'eau; assainissement, gestion des déchets et dépollution (36-39)
      '36': 'Environnement',
      '37': 'Environnement',
      '38': 'Environnement',
      '39': 'Environnement',
      
      // Construction (41-43)
      '41': 'BTP',
      '42': 'BTP',
      '43': 'BTP',
      
      // Commerce; réparation d'automobiles et de motocycles (45-47)
      '45': 'Commerce automobile',
      '46': 'Commerce de gros',
      '47': 'Commerce de détail',
      
      // Transports et entreposage (49-53)
      '49': 'Transport terrestre',
      '50': 'Transport maritime',
      '51': 'Transport aérien',
      '52': 'Logistique',
      '53': 'Services postaux',
      
      // Hébergement et restauration (55-56)
      '55': 'Hôtellerie',
      '56': 'Restauration',
      
      // Information et communication (58-63)
      '58': 'Édition et médias',
      '59': 'Audiovisuel',
      '60': 'Télécommunications',
      '61': 'Télécommunications',
      '62': 'Informatique',
      '63': 'Informatique',
      
      // Activités financières et d'assurance (64-66)
      '64': 'Banque et finance',
      '65': 'Assurance',
      '66': 'Activités financières',
      
      // Activités immobilières (68)
      '68': 'Immobilier',
      
      // Activités spécialisées, scientifiques et techniques (69-75)
      '69': 'Conseil juridique',
      '70': 'Conseil en entreprise',
      '71': 'Architecture et ingénierie',
      '72': 'Recherche et développement',
      '73': 'Publicité et marketing',
      '74': 'Services spécialisés',
      '75': 'Services vétérinaires',
      
      // Activités de services administratifs et de soutien (77-82)
      '77': 'Services',
      '78': 'Emploi et ressources humaines',
      '79': 'Tourisme',
      '80': 'Sécurité',
      '81': 'Services aux bâtiments',
      '82': 'Services administratifs',
      
      // Administration publique (84)
      '84': 'Administration publique',
      
      // Enseignement (85)
      '85': 'Enseignement',
      
      // Santé humaine et action sociale (86-88)
      '86': 'Santé',
      '87': 'Médico-social',
      '88': 'Action sociale',
      
      // Arts, spectacles et activités récréatives (90-93)
      '90': 'Arts et spectacles',
      '91': 'Culture',
      '92': 'Jeux et paris',
      '93': 'Sport et loisirs',
      
      // Autres activités de services (94-96)
      '94': 'Associations',
      '95': 'Réparation',
      '96': 'Services personnels',
      
      // Activités des ménages en tant qu'employeurs (97-98)
      '97': 'Services domestiques',
      '98': 'Services domestiques',
      
      // Activités extra-territoriales (99)
      '99': 'Organismes internationaux'
    };

    // Extraction de la section NAF (2 premiers caractères)
    const sectionNaf = codeNaf.substring(0, 2);
    let secteur: string | undefined = secteurs[sectionNaf];
    
    // Le secteur est déterminé uniquement par le code NAF
    
    console.log('✅ Code NAF', codeNaf, '-> Section', sectionNaf, '-> Secteur:', secteur || 'Non reconnu');
    
    return secteur || `Non reconnu (${codeNaf})`;
  }

  /**
   * Analyse le libellé d'activité pour déterminer le secteur
   */
  private analyzeActivityLabel(libelle: string): string | null {
    if (!libelle) return null;
    
    const libelleMinuscule = libelle.toLowerCase();
    
    // Mots-clés pour identifier les secteurs
    const motsClefsSecteurs: { [key: string]: string[] } = {
      'Enseignement': ['enseignement', 'éducation', 'formation', 'université', 'école', 'lycée', 'collège', 'académie'],
      'Informatique': ['informatique', 'logiciel', 'numérique', 'digital', 'web', 'internet', 'programmation', 'développement'],
      'Santé': ['santé', 'médical', 'médecin', 'hôpital', 'clinique', 'pharmacie', 'soins'],
      'Commerce': ['commerce', 'vente', 'magasin', 'boutique', 'distribution', 'retail'],
      'Industrie': ['industrie', 'fabrication', 'production', 'manufacture', 'usine'],
      'BTP': ['construction', 'bâtiment', 'travaux', 'génie civil', 'maçonnerie'],
      'Transport': ['transport', 'logistique', 'livraison', 'expedition'],
      'Agriculture': ['agriculture', 'agricole', 'élevage', 'culture'],
      'Restauration': ['restauration', 'restaurant', 'café', 'bar', 'traiteur'],
      'Banque et finance': ['banque', 'bancaire', 'finance', 'crédit', 'assurance'],
      'Immobilier': ['immobilier', 'immobilière', 'foncier'],
      'Administration publique': ['administration', 'public', 'municipale', 'gouvernement', 'état'],
      'Recherche et développement': ['recherche', 'développement', 'innovation', 'laboratoire'],
      'Services': ['services', 'conseil', 'consultance', 'expertise']
    };
    
    // Recherche du secteur correspondant
    for (const [secteur, motsCles] of Object.entries(motsClefsSecteurs)) {
      for (const motCle of motsCles) {
        if (libelleMinuscule.includes(motCle)) {
          console.log(`🎯 Secteur identifié par mot-clé "${motCle}":`, secteur);
          return secteur;
        }
      }
    }
    
    console.log('❌ Aucun secteur identifié dans le libellé');
    return null;
  }

  /**
   * Obtient les coordonnées géographiques d'une adresse
   */
  private async getCoordinatesFromAddress(adresse: any): Promise<{ latitude?: number; longitude?: number }> {
    try {
      // Utilisation de l'API de géocodage gouvernementale française (gratuite)
      const query = `${adresse.numeroVoie || ''} ${adresse.typeVoie || ''} ${adresse.libelleVoie || ''} ${adresse.commune || ''}`.trim();
      
      const response = await axios.get('https://api-adresse.data.gouv.fr/search/', {
        params: {
          q: query,
          limit: 1
        },
        timeout: 3000
      });

      if (response.data && response.data.features && response.data.features.length > 0) {
        const feature = response.data.features[0];
        return {
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0]
        };
      }
    } catch (error) {
      console.log('⚠️ Géocodage impossible pour:', adresse.commune);
    }

    // Coordonnées par défaut selon les grandes villes
    const coordonnees: { [key: string]: { latitude: number; longitude: number } } = {
      'paris': { latitude: 48.8566, longitude: 2.3522 },
      'lyon': { latitude: 45.7640, longitude: 4.8357 },
      'marseille': { latitude: 43.2965, longitude: 5.3698 },
      'toulouse': { latitude: 43.6047, longitude: 1.4442 },
      'nice': { latitude: 43.7102, longitude: 7.2620 },
      'nantes': { latitude: 47.2184, longitude: -1.5536 },
      'strasbourg': { latitude: 48.5734, longitude: 7.7521 },
      'montpellier': { latitude: 43.6110, longitude: 3.8767 },
      'bordeaux': { latitude: 44.8378, longitude: -0.5792 },
      'lille': { latitude: 50.6292, longitude: 3.0573 }
    };

    const ville = adresse.commune?.toLowerCase() || '';
    for (const [nom, coords] of Object.entries(coordonnees)) {
      if (ville.includes(nom)) {
        return coords;
      }
    }

    return { latitude: 48.8566, longitude: 2.3522 }; // Paris par défaut
  }

  /**
   * Calcule la distance entre deux points en kilomètres
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon de la Terre en kilomètres
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  
}

export default new SiretService();
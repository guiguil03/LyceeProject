import axios from 'axios';
import siretMockService from './siretMockService';

export interface Entreprise {
  siret: string;
  siren: string;
  denominationSociale: string;
  nomCommercial?: string;
  secteurActivite: string;
  codeAPE: string;
  libelleAPE: string;
  adresse: {
    numeroVoie?: string;
    typeVoie?: string;
    libelleVoie?: string;
    codePostal: string;
    commune: string;
    departement: string;
    region: string;
  };
  coordonnees: {
    latitude?: number;
    longitude?: number;
  };
  effectifSalarie?: string;
  trancheEffectif?: string;
  dateCreation: string;
  statutJuridique: string;
  etatAdministratif: string;
}

export interface EntrepriseSearchParams {
  siret?: string;
  siren?: string;
  denominationSociale?: string;
  commune?: string;
  departement?: string;
  codePostal?: string;
  secteurActivite?: string;
  codeAPE?: string;
}

class SiretService {
  private readonly baseUrl = 'https://api.insee.fr/entreprises/sirene/V3';
  
  // Note: En production, vous devriez utiliser une vraie clé API INSEE
  // Pour le développement, nous utiliserons l'API ouverte
  private readonly openDataUrl = 'https://entreprise.data.gouv.fr/api/sirene/v1';

  /**
   * Recherche d'entreprises selon les critères spécifiés
   */
  async searchEntreprises(params: EntrepriseSearchParams): Promise<Entreprise[]> {
    try {
      // Utilisation de l'API ouverte Sirene avec timeout
      const queryParams = new URLSearchParams();
      
      if (params.siret) {
        queryParams.append('siret', params.siret);
      }
      
      if (params.siren) {
        queryParams.append('siren', params.siren);
      }
      
      if (params.denominationSociale) {
        queryParams.append('nom', params.denominationSociale);
      }
      
      if (params.commune) {
        queryParams.append('commune', params.commune);
      }
      
      if (params.departement) {
        queryParams.append('departement', params.departement);
      }
      
      if (params.codePostal) {
        queryParams.append('code_postal', params.codePostal);
      }

      if (params.codeAPE) {
        queryParams.append('code_activite', params.codeAPE);
      }

      // Limitation du nombre de résultats
      queryParams.append('per_page', '20');

      const response = await axios.get(`${this.openDataUrl}/siret?${queryParams.toString()}`, {
        timeout: 5000 // Timeout de 5 secondes
      });
      
      return response.data.etablissements?.map((etablissement: any) => 
        this.formatEntrepriseData(etablissement)
      ) || [];
    } catch (error) {
      console.warn('API Sirene indisponible, retour d\'une liste vide:', error);
      return []; // Retourner une liste vide au lieu de lever une erreur
    }
  }

  /**
   * Récupère les détails d'une entreprise par SIRET
   */
  async getEntrepriseBySiret(siret: string): Promise<Entreprise | null> {
    try {
      const response = await axios.get(`${this.openDataUrl}/siret/${siret}`, {
        timeout: 8000 // Timeout de 8 secondes pour les requêtes individuelles
      });
      
      if (!response.data.etablissement) {
        return null;
      }

      return this.formatEntrepriseData(response.data.etablissement);
    } catch (error) {
      console.warn('API Sirene indisponible pour SIRET:', siret, error instanceof Error ? error.message : 'Erreur inconnue');
      
      // Utiliser le service mock en cas d'erreur
      return siretMockService.generateMockEntreprise(siret);
    }
  }



  /**
   * Détermine le secteur d'activité principal basé sur le code APE
   */
  getSecteurFromAPE(codeAPE: string): string {
    const secteurMapping: { [key: string]: string } = {
      // Agriculture, sylviculture et pêche (A)
      '01': 'agriculture', '02': 'agriculture', '03': 'agriculture',
      
      // Industrie extractive (B)
      '05': 'industrie', '06': 'industrie', '07': 'industrie', '08': 'industrie', '09': 'industrie',
      
      // Industrie manufacturière (C)
      '10': 'industrie', '11': 'industrie', '12': 'industrie', '13': 'industrie', '14': 'industrie',
      '15': 'industrie', '16': 'industrie', '17': 'industrie', '18': 'industrie', '19': 'industrie',
      '20': 'industrie', '21': 'industrie', '22': 'industrie', '23': 'industrie', '24': 'industrie',
      '25': 'industrie', '26': 'informatique', '27': 'industrie', '28': 'industrie', '29': 'industrie',
      '30': 'industrie', '31': 'industrie', '32': 'industrie', '33': 'industrie',
      
      // Construction (F)
      '41': 'batiment', '42': 'batiment', '43': 'batiment',
      
      // Commerce (G)
      '45': 'commerce', '46': 'commerce', '47': 'commerce',
      
      // Transport et entreposage (H)
      '49': 'transport', '50': 'transport', '51': 'transport', '52': 'transport', '53': 'transport',
      
      // Hébergement et restauration (I)
      '55': 'restauration', '56': 'restauration',
      
      // Information et communication (J)
      '58': 'informatique', '59': 'informatique', '60': 'informatique', '61': 'informatique', 
      '62': 'informatique', '63': 'informatique',
      
      // Activités financières et d'assurance (K)
      '64': 'finance', '65': 'finance', '66': 'finance',
      
      // Activités immobilières (L)
      '68': 'immobilier',
      
      // Activités spécialisées, scientifiques et techniques (M)
      '69': 'conseil', '70': 'conseil', '71': 'conseil', '72': 'informatique', '73': 'conseil',
      '74': 'conseil', '75': 'conseil',
      
      // Santé humaine et action sociale (Q)
      '86': 'sante', '87': 'sante', '88': 'sante'
    };

    const codeSecteur = codeAPE.substring(0, 2);
    return secteurMapping[codeSecteur] || 'autre';
  }

  /**
   * Formate les données reçues de l'API Sirene
   */
  private formatEntrepriseData(etablissement: any): Entreprise {
    const uniteLegale = etablissement.unite_legale || {};
    const adresseEtablissement = etablissement.adresse || {};
    
    return {
      siret: etablissement.siret || '',
      siren: etablissement.siren || uniteLegale.siren || '',
      denominationSociale: uniteLegale.denomination || uniteLegale.nom || '',
      nomCommercial: etablissement.enseigne || '',
      secteurActivite: this.getSecteurFromAPE(etablissement.activite_principale || ''),
      codeAPE: etablissement.activite_principale || '',
      libelleAPE: etablissement.libelle_activite_principale || '',
      adresse: {
        numeroVoie: adresseEtablissement.numero_voie,
        typeVoie: adresseEtablissement.type_voie,
        libelleVoie: adresseEtablissement.libelle_voie,
        codePostal: adresseEtablissement.code_postal || '',
        commune: adresseEtablissement.libelle_commune || '',
        departement: adresseEtablissement.libelle_departement || '',
        region: adresseEtablissement.libelle_region || ''
      },
      coordonnees: {
        latitude: adresseEtablissement.latitude,
        longitude: adresseEtablissement.longitude
      },
      effectifSalarie: etablissement.effectif_salarie,
      trancheEffectif: etablissement.tranche_effectif,
      dateCreation: etablissement.date_creation || uniteLegale.date_creation || '',
      statutJuridique: uniteLegale.forme_juridique || '',
      etatAdministratif: etablissement.etat_administratif || 'A'
    };
  }

  /**
   * Calcule la distance entre deux points géographiques
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance en km
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}

export default new SiretService(); 
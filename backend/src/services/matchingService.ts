import lyceeService, { LyceeProfessionnel, LyceeSearchParams } from './lyceeService';
import siretService, { Entreprise, EntrepriseSearchParams } from './siretService';

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
    distanceMax?: number; // en km
    typeEtablissement?: 'public' | 'prive' | 'tous';
    nombreResultats?: number;
  };
}

export interface MatchingResult {
  lycee: LyceeProfessionnel;
  distance?: number;
}

export interface MatchingResponse {
  entreprise?: Entreprise;
  matches: MatchingResult[];
  criteresUtilises: string[];
  suggestions?: string[];
}

class MatchingService {
  /**
   * Correspondances secteur d'activité → mots-clés de formations
   */
  private getSecteurMotsCles(secteur: string): string[] {
    const correspondances: { [key: string]: string[] } = {
      'informatique': [
        'informatique', 'numérique', 'digital', 'cyber', 'développement', 
        'programmation', 'sio', 'snir', 'système', 'réseau', 'électronique', 
        'technologique', 'ordinateur', 'logiciel', 'data', 'web'
      ],
      'commerce': [
        'commerce', 'vente', 'commercial', 'marketing', 'gestion', 'management',
        'tertiaire', 'économique', 'accueil', 'relation client', 'négociation',
        'comptabilité', 'administratif', 'secrétariat', 'bureautique'
      ],
      'industrie': [
        'industriel', 'mécanique', 'électrique', 'maintenance', 'technique',
        'production', 'usinage', 'métallurgie', 'soudure', 'automatisme',
        'robotique', 'pneumatique', 'hydraulique', 'fabrication'
      ],
      'batiment': [
        'bâtiment', 'construction', 'btp', 'travaux publics', 'génie civil',
        'maçonnerie', 'menuiserie', 'plomberie', 'électricité', 'peinture',
        'carrelage', 'couverture', 'charpente', 'aménagement'
      ],
      'restauration': [
        'restauration', 'hôtellerie', 'cuisine', 'service', 'tourisme',
        'cshcr', 'cuisinier', 'serveur', 'réception', 'accueil',
        'alimentation', 'gastronomie', 'bar', 'café'
      ],
      'transport': [
        'transport', 'logistique', 'conduite', 'automobile', 'mécanique auto',
        'maintenance véhicule', 'carrosserie', 'poids lourd', 'ambulancier',
        'livraison', 'magasinage', 'manutention'
      ],
      'sante': [
        'santé', 'social', 'aide', 'soin', 'médical', 'paramédical',
        'assp', 'services aux personnes', 'sanitaire', 'accompagnement',
        'petite enfance', 'personnes âgées', 'handicap'
      ]
    };
    
    return correspondances[secteur.toLowerCase()] || [secteur.toLowerCase()];
  }

  /**
   * Trouve des lycées professionnels correspondant à une entreprise
   */
  async findMatchingLycees(criteria: MatchingCriteria): Promise<MatchingResponse> {
    let entreprise: Entreprise | null = null;
    let secteurActivite = criteria.entreprise?.secteurActivite;
    let localisation = criteria.entreprise?.localisation;
    const criteresUtilises: string[] = [];
    const suggestions: string[] = [];

    console.log('🎯 Critères reçus:', JSON.stringify(criteria, null, 2));

    // Étape 1: Récupération des infos entreprise si SIRET fourni
    if (criteria.entreprise?.siret) {
      console.log('🔍 Recherche entreprise avec SIRET:', criteria.entreprise.siret);
      try {
        entreprise = await siretService.getEntrepriseBySiret(criteria.entreprise.siret);
        
        if (entreprise) {
          console.log('✅ Entreprise trouvée:', {
            nom: entreprise.denominationSociale,
            secteur: entreprise.secteurActivite,
            commune: entreprise.adresse.commune,
            departement: entreprise.adresse.departement
          });
          
          // Utiliser les données de l'entreprise si pas spécifiées manuellement
          if (!secteurActivite || secteurActivite.trim() === '') {
            secteurActivite = entreprise.secteurActivite;
            console.log('📊 Secteur récupéré depuis l\'entreprise:', secteurActivite);
          }
          
          if (!localisation || (!localisation.commune && !localisation.departement && !localisation.codePostal)) {
            localisation = {
              commune: entreprise.adresse.commune,
              departement: entreprise.adresse.departement,
              codePostal: entreprise.adresse.codePostal,
              latitude: entreprise.coordonnees.latitude,
              longitude: entreprise.coordonnees.longitude
            };
            console.log('📍 Localisation récupérée depuis l\'entreprise:', localisation);
          }
        } else {
          console.log('❌ Aucune entreprise trouvée pour le SIRET:', criteria.entreprise.siret);
          suggestions.push(`SIRET ${criteria.entreprise.siret} non trouvé dans la base SIRENE. Vérifiez le numéro ou continuez avec le secteur spécifié manuellement.`);
        }
      } catch (error) {
        console.error('❌ Erreur lors de la recherche SIRET:', error);
        suggestions.push(`Erreur lors de la recherche du SIRET ${criteria.entreprise.siret}. Continuons avec les données manuelles.`);
      }
    }

    // Vérification des critères obligatoires
    if (!secteurActivite || secteurActivite.trim() === '') {
      const errorMsg = 'Un secteur d\'activité doit être spécifié pour la recherche.';
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }

    console.log('🎯 Secteur d\'activité final utilisé:', secteurActivite);
    console.log('📍 Localisation finale utilisée:', localisation);

    // Étape 2: Recherche des lycées par secteur d'activité
    console.log('🔍 Recherche par secteur d\'activité');
    
    const motsClesSecteur = this.getSecteurMotsCles(secteurActivite);
    console.log('🔑 Mots-clés secteur:', motsClesSecteur);
    
    // Rechercher tous les lycées
    const tousLycees = await lyceeService.searchLycees({});
    console.log('📚 Total lycées disponibles:', tousLycees.length);

    // Filtrer par secteur d'activité
    const lyceesFiltrés = tousLycees.filter(lycee => {
      const texteAnalyse = [
        lycee.nom_etablissement,
        lycee.type_etablissement,
        ...(lycee.formations || [])
      ].join(' ').toLowerCase();
      
      const correspondance = motsClesSecteur.some(motCle => 
        texteAnalyse.includes(motCle.toLowerCase())
      );
      
      if (correspondance) {
        console.log(`✅ Lycée retenu:`, lycee.nom_etablissement, '-', lycee.libelle_commune);
      }
      
      return correspondance;
    });

    console.log(`🎯 Lycées trouvés pour secteur ${secteurActivite}:`, lyceesFiltrés.length);
    criteresUtilises.push(`Secteur: ${secteurActivite} (${lyceesFiltrés.length} lycées)`);

    // Filtrage par type d'établissement si spécifié
    let lyceesAvecType = lyceesFiltrés;
    if (criteria.preferences?.typeEtablissement && criteria.preferences.typeEtablissement !== 'tous') {
      const typeRecherche = criteria.preferences.typeEtablissement === 'public' ? 'Public' : 'Privé';
      lyceesAvecType = lyceesFiltrés.filter(lycee => 
        lycee.statut_public_prive === typeRecherche
      );
      console.log(`🏛️ Filtrage par type ${typeRecherche}:`, lyceesAvecType.length, 'lycées');
      criteresUtilises.push(`Type: ${typeRecherche} (${lyceesAvecType.length} lycées)`);
    }

    // Calcul des distances si localisation disponible
    const lyceesAvecDistance = lyceesAvecType.map(lycee => {
      const result: MatchingResult = { lycee };
      
      if (localisation?.latitude && localisation?.longitude && lycee.latitude && lycee.longitude) {
        const distance = siretService.calculateDistance(
          localisation.latitude,
          localisation.longitude,
          lycee.latitude,
          lycee.longitude
        );
        result.distance = Math.round(distance * 10) / 10;
      }
      
      return result;
    });

    // Filtrage par distance si spécifiée
    let lyceesFinaux = lyceesAvecDistance;
    if (criteria.preferences?.distanceMax && localisation?.latitude && localisation?.longitude) {
      lyceesFinaux = lyceesAvecDistance.filter(result => 
        !result.distance || result.distance <= criteria.preferences!.distanceMax!
      );
      console.log(`📏 Filtrage par distance (${criteria.preferences.distanceMax}km):`, lyceesFinaux.length, 'lycées');
      criteresUtilises.push(`Distance max: ${criteria.preferences.distanceMax}km (${lyceesFinaux.length} lycées)`);
    }

    // Tri par distance croissante
    lyceesFinaux.sort((a, b) => {
      if (a.distance && b.distance) return a.distance - b.distance;
      if (a.distance && !b.distance) return -1;
      if (!a.distance && b.distance) return 1;
      return 0;
    });

    // Limitation du nombre de résultats
    const nombreResultats = criteria.preferences?.nombreResultats || 10;
    const resultatsLimités = lyceesFinaux.slice(0, nombreResultats);

    console.log(`📊 Résultats finaux: ${resultatsLimités.length}/${lyceesFinaux.length} (limite: ${nombreResultats})`);

    return {
      entreprise: entreprise || undefined,
      matches: resultatsLimités,
      criteresUtilises,
      suggestions
    };
  }

  /**
   * Trouve des entreprises proches d'un lycée professionnel
   */
  async findEntreprisesForLycee(uai: string, distance: number = 50): Promise<{
    lycee: LyceeProfessionnel | null;
    entreprises: Entreprise[];
  }> {
    const lycee = await lyceeService.getLyceeByUAI(uai);
    
    if (!lycee) {
      return {
        lycee: null,
        entreprises: []
      };
    }

    const searchParams: EntrepriseSearchParams = {};

    // Recherche par zone géographique si coordonnées disponibles
    if (lycee.latitude && lycee.longitude) {
      searchParams.latitude = lycee.latitude;
      searchParams.longitude = lycee.longitude;
      searchParams.rayon = distance;
    } else {
      // Fallback sur commune/département
      searchParams.commune = lycee.libelle_commune;
      searchParams.departement = lycee.libelle_departement;
    }

    const entreprises = await siretService.searchEntreprises(searchParams);

    // Filtrage par distance si coordonnées disponibles
    let entreprisesFiltrees = entreprises;
    if (lycee.latitude && lycee.longitude) {
      entreprisesFiltrees = entreprises.filter(entreprise => {
        if (entreprise.coordonnees.latitude && entreprise.coordonnees.longitude) {
          const dist = siretService.calculateDistance(
            lycee.latitude,
            lycee.longitude,
            entreprise.coordonnees.latitude,
            entreprise.coordonnees.longitude
          );
          return dist <= distance;
        }
        return true; // Garder les entreprises sans coordonnées
      });
    }

    return {
      lycee,
      entreprises: entreprisesFiltrees
    };
  }
}

export default new MatchingService(); 
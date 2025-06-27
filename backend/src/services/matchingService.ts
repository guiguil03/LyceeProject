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

class MatchingService {
  /**
   * Correspondances secteur d'activité → mots-clés de formations
   * NOUVELLE LOGIQUE: Priorité absolue au secteur d'activité
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
   * NOUVELLE LOGIQUE: Secteur d'activité d'abord, puis géographie
   */
  async findMatchingLycees(criteria: MatchingCriteria): Promise<MatchingResponse> {
    let entreprise: Entreprise | null = null;
    let secteurActivite = criteria.entreprise?.secteurActivite;
    let localisation = criteria.entreprise?.localisation;
    const criteresUtilises: string[] = [];
    const suggestions: string[] = [];

    console.log('🎯 NOUVELLE LOGIQUE DE MATCHING - Critères reçus:', JSON.stringify(criteria, null, 2));

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
          
          // PRIORITÉ aux données de l'entreprise trouvée via SIRET
          // Si secteur pas spécifié manuellement, utiliser celui de l'entreprise
          if (!secteurActivite || secteurActivite.trim() === '') {
            secteurActivite = entreprise.secteurActivite;
            console.log('📊 Secteur récupéré depuis l\'entreprise:', secteurActivite);
          }
          
          // Si localisation pas spécifiée manuellement, utiliser celle de l'entreprise
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

    // Vérification des critères obligatoires après traitement SIRET
    if (!secteurActivite || secteurActivite.trim() === '') {
      const errorMsg = 'Un secteur d\'activité doit être spécifié pour la recherche. ' + 
                      (criteria.entreprise?.siret ? 
                       'Le SIRET fourni ne permet pas de déterminer le secteur automatiquement. Veuillez sélectionner un secteur manuellement.' : 
                       'Veuillez sélectionner un secteur dans la liste.');
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }

    console.log('🎯 Secteur d\'activité final utilisé:', secteurActivite);
    console.log('📍 Localisation finale utilisée:', localisation);

    // Étape 2: Recherche de TOUS les lycées correspondant au secteur d'activité
    console.log('🔍 ÉTAPE 1: Recherche par SECTEUR D\'ACTIVITÉ en priorité');
    
    const motsClesSecteur = this.getSecteurMotsCles(secteurActivite);
    console.log('🔑 Mots-clés secteur:', motsClesSecteur);
    
    // Rechercher tous les lycées qui correspondent au secteur
    const tousLycees = await lyceeService.searchLycees({});
    console.log('📚 Total lycées disponibles:', tousLycees.length);

    // Filtrer par secteur d'activité STRICTEMENT
    const lyceesAvecSecteur = tousLycees.filter(lycee => {
      const texteAnalyse = [
        lycee.nom_etablissement,
        lycee.type_etablissement,
        // Les formations sont souvent vides dans l'API, on ne les utilise qu'en bonus
        ...(lycee.formations || [])
      ].join(' ').toLowerCase();
      
      console.log(`🔍 Analyse lycée: ${lycee.nom_etablissement}`);
      console.log(`📄 Texte analysé: "${texteAnalyse.substring(0, 200)}..."`);
      console.log(`📚 Formations disponibles (${lycee.formations.length}):`, lycee.formations.slice(0, 3));
      console.log(`🔎 Recherche mots-clés:`, motsClesSecteur);
      
      const correspondance = motsClesSecteur.some(motCle => {
        const found = texteAnalyse.includes(motCle.toLowerCase());
        if (found) {
          console.log(`✅ CORRESPONDANCE trouvée avec mot-clé: "${motCle}"`);
        }
        return found;
      });
      
      if (correspondance) {
        console.log(`✅ Lycée RETENU pour secteur ${secteurActivite}:`, lycee.nom_etablissement, '-', lycee.libelle_commune);
      } else {
        console.log(`❌ Lycée REJETÉ:`, lycee.nom_etablissement, '- aucune correspondance trouvée');
      }
      
      return correspondance;
    });

    console.log(`🎯 Lycées trouvés pour secteur ${secteurActivite}:`, lyceesAvecSecteur.length);
    criteresUtilises.push(`Secteur: ${secteurActivite} (${lyceesAvecSecteur.length} lycées)`);

    if (lyceesAvecSecteur.length === 0) {
      console.log('⚠️ Aucun lycée trouvé par filtrage strict, essayons un filtrage plus souple...');
      
      // Filtrage plus souple : chercher juste "lycée" + "professionnel" + termes génériques
      const lyceesGeneral = tousLycees.filter(lycee => {
        const texte = [lycee.nom_etablissement, lycee.type_etablissement].join(' ').toLowerCase();
        return (texte.includes('lycée') || texte.includes('professionnel') || 
                texte.includes('technique') || texte.includes('technologique'));
      });
      
      console.log(`📚 Lycées généraux trouvés: ${lyceesGeneral.length}`);
      
      if (lyceesGeneral.length > 0) {
        suggestions.push(`Aucun lycée spécialisé en ${secteurActivite} trouvé. Affichage des lycées professionnels de la zone.`);
        return {
          entreprise: entreprise || undefined,
          matches: this.calculateMatches(
            lyceesGeneral.slice(0, criteria.preferences?.nombreResultats || 10),
            entreprise,
            secteurActivite,
            localisation,
            criteria.preferences
          ),
          criteresUtilises: [...criteresUtilises, 'Élargi aux lycées professionnels généraux'],
          suggestions
        };
      }
      
      suggestions.push(`Aucun lycée trouvé. Essayez d'élargir la zone géographique ou vérifiez l'orthographe.`);
      return {
        entreprise: entreprise || undefined,
        matches: [],
        criteresUtilises,
        suggestions
      };
    }

    // Étape 3: Filtrage géographique si localisation fournie
    let lyceesFiltres = lyceesAvecSecteur;
    
    if (localisation && (localisation.commune || localisation.departement || localisation.latitude)) {
      console.log('🔍 ÉTAPE 2: Filtrage GÉOGRAPHIQUE sur les lycées du bon secteur');
      
      lyceesFiltres = lyceesAvecSecteur.filter(lycee => {
        // Filtre par distance si coordonnées disponibles
        if (localisation.latitude && localisation.longitude && 
            lycee.latitude && lycee.longitude && 
            criteria.preferences?.distanceMax) {
          
          const distance = siretService.calculateDistance(
            localisation.latitude,
            localisation.longitude,
            lycee.latitude,
            lycee.longitude
          );
          
          const dansZone = distance <= criteria.preferences.distanceMax;
          if (dansZone) {
            console.log(`📍 Lycée dans zone ${criteria.preferences.distanceMax}km:`, lycee.nom_etablissement, `(${Math.round(distance)}km)`);
          }
          return dansZone;
        }
        
        // Sinon filtre par commune/département
        if (localisation.commune && lycee.libelle_commune.toLowerCase() === localisation.commune.toLowerCase()) {
          console.log(`🏙️ Lycée même commune:`, lycee.nom_etablissement, '-', lycee.libelle_commune);
          return true;
        }
        
        if (localisation.departement && lycee.libelle_departement.toLowerCase() === localisation.departement.toLowerCase()) {
          console.log(`🗺️ Lycée même département:`, lycee.nom_etablissement, '-', lycee.libelle_departement);
          return true;
        }
        
        return false;
      });
      
      console.log(`📍 Lycées après filtrage géographique: ${lyceesFiltres.length}/${lyceesAvecSecteur.length}`);
      
      if (lyceesFiltres.length === 0) {
        console.log('⚠️ Aucun lycée du bon secteur dans la zone, élargissement...');
        lyceesFiltres = lyceesAvecSecteur.slice(0, criteria.preferences?.nombreResultats || 10);
        suggestions.push(`Aucun lycée spécialisé en ${secteurActivite} trouvé dans votre zone. Résultats élargis géographiquement.`);
        criteresUtilises.push('Zone élargie (pas de correspondance locale)');
      } else {
        if (localisation.latitude && localisation.longitude && criteria.preferences?.distanceMax) {
          criteresUtilises.push(`Zone: ${criteria.preferences.distanceMax}km autour de l'entreprise`);
        } else {
          criteresUtilises.push(`Zone: ${localisation.commune || localisation.departement || 'coordonnées GPS'}`);
        }
      }
    } else {
      console.log('⚠️ Aucune localisation fournie, tri par pertinence générale');
      suggestions.push('Aucune localisation spécifiée. Résultats triés par pertinence générale.');
    }

    // Étape 4: Filtrage par type d'établissement
    if (criteria.preferences?.typeEtablissement && criteria.preferences.typeEtablissement !== 'tous') {
      const avant = lyceesFiltres.length;
      lyceesFiltres = lyceesFiltres.filter(lycee => {
        const isPublic = lycee.statut_public_prive === 'Public';
        return (criteria.preferences?.typeEtablissement === 'public' && isPublic) ||
               (criteria.preferences?.typeEtablissement === 'prive' && !isPublic);
      });
      console.log(`🏛️ Filtrage par type (${criteria.preferences.typeEtablissement}): ${lyceesFiltres.length}/${avant}`);
      criteresUtilises.push(`Type: ${criteria.preferences.typeEtablissement}`);
    }

    // Étape 5: Calcul des scores et tri
    console.log('🎯 ÉTAPE 3: Calcul des scores de pertinence');
    const matches = this.calculateMatches(
      lyceesFiltres,
      entreprise,
      secteurActivite,
      localisation,
      criteria.preferences
    );

    // Étape 6: Limitation du nombre de résultats
    const nombreResultats = criteria.preferences?.nombreResultats || 10;
    const matchesLimites = matches.slice(0, nombreResultats);
    
    console.log(`📊 Résultats finaux: ${matchesLimites.length}/${matches.length} (limite: ${nombreResultats})`);
    criteresUtilises.push(`Limité à ${nombreResultats} résultats`);

    if (matchesLimites.length === 0) {
      suggestions.push('Essayez d\'élargir vos critères de recherche (distance, type d\'établissement)');
    } else {
      if (localisation && localisation.latitude && localisation.longitude) {
        suggestions.push(`${matchesLimites.length} lycées trouvés. Les résultats sont triés par spécialisation et proximité.`);
      } else {
        suggestions.push(`${matchesLimites.length} lycées trouvés. Spécifiez une localisation pour un tri géographique optimal.`);
      }
    }

    return {
      entreprise: entreprise || undefined,
      matches: matchesLimites,
      criteresUtilises,
      suggestions
    };
  }

  /**
   * Recherche d'entreprises dans une zone géographique pour un lycée
   */
  async findEntreprisesForLycee(uai: string, distance: number = 50): Promise<{
    lycee: LyceeProfessionnel | null;
    entreprises: Entreprise[];
  }> {
    const lycee = await lyceeService.getLyceeByUAI(uai);
    
    if (!lycee) {
      return { lycee: null, entreprises: [] };
    }

    // Recherche d'entreprises dans la même zone
    const searchParams: EntrepriseSearchParams = {
      commune: lycee.libelle_commune,
      departement: lycee.libelle_departement
    };

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

  /**
   * Calcule les scores de matching avec NOUVEAU SYSTÈME DE SCORING
   * Priorité: Secteur (60 pts) + Géographie (40 pts)
   */
  private calculateMatches(
    lycees: LyceeProfessionnel[],
    entreprise: Entreprise | null,
    secteurActivite?: string,
    localisation?: any,
    preferences?: any
  ): MatchingResult[] {
    const matches: MatchingResult[] = [];

    for (const lycee of lycees) {
      const result: MatchingResult = {
        lycee,
        score: 0,
        motifs: []
      };

      // 🎯 SCORE SECTEUR (60 points max) - PRIORITÉ ABSOLUE
      if (secteurActivite) {
        const motsClesSecteur = this.getSecteurMotsCles(secteurActivite);
        const texteAnalyse = [
          lycee.nom_etablissement,
          lycee.type_etablissement,
          ...lycee.formations
        ].join(' ').toLowerCase();
        
        // Calcul de la correspondance secteur
        const motsCorrespondants = motsClesSecteur.filter(motCle => 
          texteAnalyse.includes(motCle.toLowerCase())
        );
        
        if (motsCorrespondants.length > 0) {
          // Score proportionnel au nombre de mots-clés trouvés
          const scoreSeceur = Math.min(60, 30 + (motsCorrespondants.length * 10));
          result.score += scoreSeceur;
          result.motifs.push(`🎯 Spécialisé en ${secteurActivite} (${motsCorrespondants.length} correspondances)`);
          
          // Bonus pour correspondance exacte dans le nom
          if (lycee.nom_etablissement.toLowerCase().includes(secteurActivite.toLowerCase())) {
            result.score += 10;
            result.motifs.push(`💯 Nom contient "${secteurActivite}"`);
          }
        }
      }

      // 📍 SCORE GÉOGRAPHIQUE (40 points max)
      if (localisation) {
        // Distance exacte si coordonnées disponibles
        if (localisation.latitude && localisation.longitude && lycee.latitude && lycee.longitude) {
          const distance = siretService.calculateDistance(
            localisation.latitude,
            localisation.longitude,
            lycee.latitude,
            lycee.longitude
          );
          result.distance = Math.round(distance * 10) / 10;

          if (distance <= 5) {
            result.score += 40;
            result.motifs.push(`📍 Très proche (${result.distance} km)`);
          } else if (distance <= 15) {
            result.score += 30;
            result.motifs.push(`📍 Proche (${result.distance} km)`);
          } else if (distance <= 30) {
            result.score += 20;
            result.motifs.push(`📍 Accessible (${result.distance} km)`);
          } else if (distance <= 50) {
            result.score += 10;
            result.motifs.push(`📍 Dans la zone (${result.distance} km)`);
          } else {
            result.score += 5;
            result.motifs.push(`📍 Éloigné (${result.distance} km)`);
          }
        } else {
          // Correspondance textuelle commune/département
          if (lycee.libelle_commune.toLowerCase() === localisation.commune?.toLowerCase()) {
            result.score += 35;
            result.motifs.push('🏙️ Même commune');
          } else if (lycee.libelle_departement.toLowerCase() === localisation.departement?.toLowerCase()) {
            result.score += 25;
            result.motifs.push('🗺️ Même département');
          } else if (lycee.code_postal_uai.substring(0, 2) === localisation.codePostal?.substring(0, 2)) {
            result.score += 15;
            result.motifs.push('📮 Même zone (code postal)');
          }
        }
      }

      // 🏛️ BONUS ÉTABLISSEMENT (bonus de 5-10 points)
      if (lycee.statut_public_prive === 'Public') {
        result.score += 5;
        result.motifs.push('🏛️ Établissement public');
      }

      // 📞 BONUS CONTACT (bonus de 5 points)
      if (lycee.mail && lycee.telephone) {
        result.score += 5;
        result.motifs.push('📞 Contact complet disponible');
      } else if (lycee.mail || lycee.telephone) {
        result.score += 3;
        result.motifs.push('📞 Contact disponible');
      }

      // 🌐 BONUS SITE WEB (bonus de 3 points)
      if (lycee.web) {
        result.score += 3;
        result.motifs.push('🌐 Site web disponible');
      }

      // Tous les lycées présélectionnés ont au moins un score de base
      if (result.score === 0) {
        result.score = 10; // Score minimum pour lycées présélectionnés
        result.motifs.push('📚 Établissement dans la base de données');
      }

      matches.push(result);
      console.log(`🏫 ${lycee.nom_etablissement} | Score: ${result.score}/100 | ${result.motifs.join(' • ')}`);
    }

    console.log(`📈 Total matches calculés: ${matches.length}`);

    // Tri par score décroissant puis par distance croissante
    return matches.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.distance && b.distance) return a.distance - b.distance;
      return 0;
    });
  }

  /**
   * Vérifie si un secteur d'activité est compatible avec les formations d'un lycée
   * (Méthode legacy conservée pour compatibilité)
   */
  private isSecteurCompatible(secteur: string, formations: string[]): boolean {
    const motsCles = this.getSecteurMotsCles(secteur);
    
    return formations.some(formation => 
      motsCles.some(motCle => 
        formation.toLowerCase().includes(motCle.toLowerCase())
      )
    );
  }

  /**
   * Obtient des statistiques sur les correspondances possibles
   */
  async getMatchingStats(secteur: string, departement?: string): Promise<{
    nombreLycees: number;
    principalesVilles: string[];
    formationsDisponibles: string[];
  }> {
    const searchParams: LyceeSearchParams = {};
    if (departement) {
      searchParams.departement = departement;
    }

    const lycees = await lyceeService.searchLyceesBySector(secteur, searchParams);
    
    const villes = [...new Set(lycees.map(l => l.libelle_commune))];
    const formations = [...new Set(lycees.flatMap(l => l.formations))];

    return {
      nombreLycees: lycees.length,
      principalesVilles: villes.slice(0, 10), // Top 10 des villes
      formationsDisponibles: formations.slice(0, 20) // Top 20 des formations
    };
  }
}

export default new MatchingService(); 
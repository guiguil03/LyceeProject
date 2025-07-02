import db from './databaseService';
import lyceeService from './lyceeService';
import siretService from './siretService';
import { Lycee, Entreprise } from '../types/database';

class SyncService {
  /**
   * Synchronise un lycée depuis l'API vers la base de données
   */
  async syncLyceeFromAPI(lyceeAPI: any): Promise<string> {
    try {
      // Vérifier si le lycée existe déjà
      const existingResult = await db.query(
        'SELECT id FROM "Lycee" WHERE numero_uai = $1 OR nom = $2',
        [lyceeAPI.numero_uai, lyceeAPI.nom_etablissement]
      );

      if (existingResult.rows.length > 0) {
        // Mettre à jour le lycée existant
        const lyceeId = existingResult.rows[0].id;
        await this.updateLyceeFromAPI(lyceeId, lyceeAPI);
        return lyceeId;
      } else {
        // Créer un nouveau lycée
        return await this.createLyceeFromAPI(lyceeAPI);
      }
    } catch (error) {
      console.error('Erreur sync lycée:', error);
      throw error;
    }
  }

  /**
   * Crée un lycée en base depuis les données API
   */
  private async createLyceeFromAPI(lyceeAPI: any): Promise<string> {
    // Récupérer l'ID de la région si elle existe
    let regionId = null;
    if (lyceeAPI.libelle_region) {
      const regionResult = await db.query(
        'SELECT id FROM "Region" WHERE nom = $1',
        [lyceeAPI.libelle_region]
      );
      
      if (regionResult.rows.length === 0) {
        // Créer la région si elle n'existe pas
        regionId = await db.insertAndReturnId('Region', {
          nom: lyceeAPI.libelle_region
        });
      } else {
        regionId = regionResult.rows[0].id;
      }
    }

    // Créer le lycée
    const lyceeData = {
      nom: lyceeAPI.nom_etablissement,
      numero_uai: lyceeAPI.numero_uai,
      type_etablissement: lyceeAPI.type_etablissement,
      statut_public_prive: lyceeAPI.statut_public_prive,
      adresse: lyceeAPI.adresse_1,
      code_postal: lyceeAPI.code_postal_uai,
      commune: lyceeAPI.libelle_commune,
      departement: lyceeAPI.libelle_departement,
      region_id: regionId,
      latitude: lyceeAPI.latitude,
      longitude: lyceeAPI.longitude,
      telephone: lyceeAPI.telephone,
      email: lyceeAPI.mail,
      site_web: lyceeAPI.web
    };

    const lyceeId = await db.insertAndReturnId('Lycee', lyceeData);

    // Synchroniser les formations si disponibles
    if (lyceeAPI.formations && Array.isArray(lyceeAPI.formations)) {
      await this.syncFormations(lyceeId, lyceeAPI.formations);
    }

    console.log(`✅ Lycée synchronisé: ${lyceeAPI.nom_etablissement} (ID: ${lyceeId})`);
    return lyceeId;
  }

  /**
   * Met à jour un lycée existant
   */
  private async updateLyceeFromAPI(lyceeId: string, lyceeAPI: any): Promise<void> {
    const updateData = {
      nom: lyceeAPI.nom_etablissement,
      numero_uai: lyceeAPI.numero_uai,
      type_etablissement: lyceeAPI.type_etablissement,
      statut_public_prive: lyceeAPI.statut_public_prive,
      adresse: lyceeAPI.adresse_1,
      code_postal: lyceeAPI.code_postal_uai,
      commune: lyceeAPI.libelle_commune,
      departement: lyceeAPI.libelle_departement,
      latitude: lyceeAPI.latitude,
      longitude: lyceeAPI.longitude,
      telephone: lyceeAPI.telephone,
      email: lyceeAPI.mail,
      site_web: lyceeAPI.web
    };

    await db.updateById('Lycee', lyceeId, updateData);
    console.log(`🔄 Lycée mis à jour: ${lyceeAPI.nom_etablissement}`);
  }

  /**
   * Synchronise une entreprise depuis l'API SIRENE vers la base
   */
  async syncEntrepriseFromAPI(entrepriseAPI: any): Promise<string> {
    try {
      // Vérifier si l'entreprise existe déjà
      const existingResult = await db.query(
        'SELECT id FROM "Entreprise" WHERE siret = $1',
        [entrepriseAPI.siret]
      );

      if (existingResult.rows.length > 0) {
        // Mettre à jour l'entreprise existante
        const entrepriseId = existingResult.rows[0].id;
        await this.updateEntrepriseFromAPI(entrepriseId, entrepriseAPI);
        return entrepriseId;
      } else {
        // Créer une nouvelle entreprise
        return await this.createEntrepriseFromAPI(entrepriseAPI);
      }
    } catch (error) {
      console.error('Erreur sync entreprise:', error);
      throw error;
    }
  }

  /**
   * Crée une entreprise en base depuis les données API
   */
  private async createEntrepriseFromAPI(entrepriseAPI: any): Promise<string> {
    const entrepriseData = {
      nom: entrepriseAPI.denominationSociale,
      siret: entrepriseAPI.siret,
      siren: entrepriseAPI.siren,
      secteur_activite: entrepriseAPI.secteurActivite,
      adresse: `${entrepriseAPI.adresse?.numeroVoie || ''} ${entrepriseAPI.adresse?.typeVoie || ''} ${entrepriseAPI.adresse?.libelleVoie || ''}`.trim(),
      code_postal: entrepriseAPI.adresse?.codePostal,
      commune: entrepriseAPI.adresse?.commune,
      departement: entrepriseAPI.adresse?.departement,
      latitude: entrepriseAPI.coordonnees?.latitude,
      longitude: entrepriseAPI.coordonnees?.longitude
    };

    const entrepriseId = await db.insertAndReturnId('Entreprise', entrepriseData);
    console.log(`✅ Entreprise synchronisée: ${entrepriseAPI.denominationSociale} (ID: ${entrepriseId})`);
    return entrepriseId;
  }

  /**
   * Met à jour une entreprise existante
   */
  private async updateEntrepriseFromAPI(entrepriseId: string, entrepriseAPI: any): Promise<void> {
    const updateData = {
      nom: entrepriseAPI.denominationSociale,
      secteur_activite: entrepriseAPI.secteurActivite,
      adresse: `${entrepriseAPI.adresse?.numeroVoie || ''} ${entrepriseAPI.adresse?.typeVoie || ''} ${entrepriseAPI.adresse?.libelleVoie || ''}`.trim(),
      code_postal: entrepriseAPI.adresse?.codePostal,
      commune: entrepriseAPI.adresse?.commune,
      departement: entrepriseAPI.adresse?.departement,
      latitude: entrepriseAPI.coordonnees?.latitude,
      longitude: entrepriseAPI.coordonnees?.longitude
    };

    await db.updateById('Entreprise', entrepriseId, updateData);
    console.log(`🔄 Entreprise mise à jour: ${entrepriseAPI.denominationSociale}`);
  }

  /**
   * Synchronise les formations d'un lycée
   */
  private async syncFormations(lyceeId: string, formations: string[]): Promise<void> {
    for (const formationNom of formations) {
      if (!formationNom || formationNom.trim() === '') continue;

      // Vérifier si la formation existe déjà pour ce lycée
      const existingResult = await db.query(
        'SELECT id FROM "Formation" WHERE lycee_id = $1 AND intitule = $2',
        [lyceeId, formationNom.trim()]
      );

      if (existingResult.rows.length === 0) {
        // Essayer de déterminer le domaine et métier
        const { domaineId, metierId } = await this.inferDomaineMetier(formationNom);

        await db.insertAndReturnId('Formation', {
          lycee_id: lyceeId,
          intitule: formationNom.trim(),
          domaine_id: domaineId,
          metier_id: metierId
        });
      }
    }
  }

  /**
   * Infère le domaine et métier d'une formation par analyse textuelle
   */
  private async inferDomaineMetier(formation: string): Promise<{ domaineId: string | null, metierId: string | null }> {
    const formationLower = formation.toLowerCase();
    
    // Récupérer tous les domaines et métiers
    const domainesResult = await db.query('SELECT * FROM "Domaine"');
    const metiersResult = await db.query(`
      SELECT m.*, d.nom as domaine_nom 
      FROM "Metier" m 
      LEFT JOIN "Domaine" d ON m.domaine_id = d.id
    `);

    let domaineId = null;
    let metierId = null;

    // Recherche par mots-clés dans les domaines
    for (const domaine of domainesResult.rows) {
      const motsCles = this.getMotsClesDomaine(domaine.nom);
      if (motsCles.some(mot => formationLower.includes(mot))) {
        domaineId = domaine.id;
        break;
      }
    }

    // Recherche par mots-clés dans les métiers
    for (const metier of metiersResult.rows) {
      const motsCles = metier.nom.toLowerCase().split(' ');
      if (motsCles.some((mot: string) => formationLower.includes(mot)) || formationLower.includes(metier.nom.toLowerCase())) {
        metierId = metier.id;
        if (!domaineId) {
          domaineId = metier.domaine_id;
        }
        break;
      }
    }

    return { domaineId, metierId };
  }

  /**
   * Retourne les mots-clés associés à un domaine
   */
  private getMotsClesDomaine(nomDomaine: string): string[] {
    const correspondances: { [key: string]: string[] } = {
      'Informatique et numérique': ['informatique', 'numérique', 'digital', 'développement', 'programmation', 'système', 'réseau'],
      'Commerce et gestion': ['commerce', 'vente', 'commercial', 'marketing', 'gestion', 'comptabilité'],
      'Industrie et maintenance': ['industriel', 'mécanique', 'électrique', 'maintenance', 'technique', 'production'],
      'Bâtiment et travaux publics': ['bâtiment', 'construction', 'btp', 'maçonnerie', 'plomberie', 'électricité'],
      'Hôtellerie-restauration': ['hôtellerie', 'restauration', 'cuisine', 'service', 'tourisme'],
      'Transport et logistique': ['transport', 'logistique', 'conduite', 'automobile'],
      'Santé et social': ['santé', 'social', 'aide', 'soin', 'médical'],
      'Sécurité': ['sécurité', 'surveillance', 'protection']
    };

    return correspondances[nomDomaine] || [];
  }

  /**
   * Synchronise des lycées depuis une recherche API
   */
  async syncLyceesFromSearch(searchParams: any): Promise<string[]> {
    try {
      console.log('🔄 Synchronisation lycées depuis API...');
      const lycees = await lyceeService.searchLycees(searchParams);
      
      const lyceeIds: string[] = [];
      for (const lycee of lycees) {
        const lyceeId = await this.syncLyceeFromAPI(lycee);
        lyceeIds.push(lyceeId);
      }

      console.log(`✅ ${lyceeIds.length} lycées synchronisés`);
      return lyceeIds;
    } catch (error) {
      console.error('Erreur sync lycées:', error);
      throw error;
    }
  }

  /**
   * Synchronise une entreprise depuis son SIRET
   */
  async syncEntrepriseFromSiret(siret: string): Promise<string | null> {
    try {
      console.log(`🔄 Synchronisation entreprise SIRET: ${siret}`);
      const entreprise = await siretService.getEntrepriseBySiret(siret);
      
      if (!entreprise) {
        console.log('❌ Entreprise non trouvée via API');
        return null;
      }

      const entrepriseId = await this.syncEntrepriseFromAPI(entreprise);
      console.log(`✅ Entreprise synchronisée`);
      return entrepriseId;
    } catch (error) {
      console.error('Erreur sync entreprise:', error);
      throw error;
    }
  }
}

export default new SyncService();

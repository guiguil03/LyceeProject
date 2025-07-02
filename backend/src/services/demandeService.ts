import db from './databaseService';
import { 
  Demande, 
  DemandeLycee, 
  CreateDemandeRequest, 
  UpdateDemandeRequest,
  DemandeStats 
} from '../types/database';

class DemandeService {
  /**
   * Crée une nouvelle demande de partenariat
   */
  async createDemande(data: CreateDemandeRequest, userId: string = 'anonymous'): Promise<string> {
    return await db.transaction(async (client) => {
      console.log('DemandeService.createDemande - Données reçues:', JSON.stringify(data, null, 2));
      console.log('DemandeService.createDemande - UserId reçu:', userId);
      
      // Vérifier si entreprise_id est un UUID ou un SIRET
      let entrepriseId = data.entreprise_id;
      
      if (!data.entreprise_id) {
        throw new Error('entreprise_id est requis');
      }
      
      // Si ce n'est pas un UUID (format SIRET probable), créer ou récupérer l'entreprise
      if (!this.isValidUUID(data.entreprise_id)) {
        const siret = data.entreprise_id;
        
        // Chercher une entreprise existante avec ce SIRET
        const existingEntreprise = await db.query(
          'SELECT id FROM "Entreprise" WHERE siret = $1',
          [siret]
        );
        
        if (existingEntreprise.rows.length > 0) {
          entrepriseId = existingEntreprise.rows[0].id;
        } else {
          // Créer une entreprise temporaire
          entrepriseId = await this.createTemporaryEntreprise(siret);
        }
      }

      // Insérer la demande avec l'UUID correct
      const demandeData = {
        ...data,
        entreprise_id: entrepriseId,
        statut: 'EN_ATTENTE',
        priorite: data.priorite || 'NORMALE'
      };

      const demandeId = await db.insertAndReturnId('Demande', demandeData);

      // Créer l'action de création seulement si userId est un UUID valide
      if (this.isValidUUID(userId)) {
        try {
          await db.query(
            `INSERT INTO "Action" ("demande_id", "user_id", "type_action", "commentaire") 
             VALUES ($1, $2, $3, $4)`,
            [demandeId, userId, 'CREATION', 'Demande créée']
          );
        } catch (error) {
          console.warn('Impossible de créer l\'action (utilisateur invalide):', error);
          // Continue malgré l'erreur de création d'action
        }
      } else {
        console.warn('User ID invalide, action non créée:', userId);
      }

      return demandeId;
    });
  }

  /**
   * Récupère une demande par ID avec ses relations
   */
  async getDemandeById(id: string): Promise<Demande | null> {
    const result = await db.query(`
      SELECT 
        d.*,
        e.nom as entreprise_nom,
        e.secteur_activite,
        m.nom as metier_nom,
        dom.nom as domaine_nom
      FROM "Demande" d
      LEFT JOIN "Entreprise" e ON d.entreprise_id = e.id
      LEFT JOIN "Metier" m ON d.metier_id = m.id
      LEFT JOIN "Domaine" dom ON m.domaine_id = dom.id
      WHERE d.id = $1
    `, [id]);

    if (result.rows.length === 0) return null;

    const demande = result.rows[0];
    
    // Récupérer les lycées associés
    const lyceesResult = await db.query(`
      SELECT 
        dl.*,
        l.nom as lycee_nom,
        l.adresse as lycee_adresse,
        u.full_name as user_traitement_nom
      FROM "DemandeLycee" dl
      LEFT JOIN "Lycee" l ON dl.lycee_id = l.id
      LEFT JOIN "User" u ON dl.user_traitement_id = u.id
      WHERE dl.demande_id = $1
      ORDER BY dl.score_matching DESC, dl.distance_km ASC
    `, [id]);

    return {
      ...demande,
      lycees: lyceesResult.rows
    };
  }

  /**
   * Met à jour une demande
   */
  async updateDemande(id: string, data: UpdateDemandeRequest, userId: string): Promise<boolean> {
    return await db.transaction(async (client) => {
      // Récupérer l'état actuel
      const currentResult = await client.query('SELECT * FROM "Demande" WHERE id = $1', [id]);
      if (currentResult.rows.length === 0) return false;
      
      const currentDemande = currentResult.rows[0];
      
      // Mettre à jour
      const success = await db.updateById('Demande', id, data);
      
      if (success) {
        // Créer l'action de modification
        await client.query(`
          INSERT INTO "Action" ("demande_id", "user_id", "type_action", "commentaire", "donnees_avant", "donnees_apres") 
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          id, 
          userId, 
          'MODIFICATION', 
          'Demande modifiée',
          JSON.stringify(currentDemande),
          JSON.stringify(data)
        ]);
      }
      
      return success;
    });
  }

  /**
   * Recherche des demandes avec filtres
   */
  async searchDemandes(filters: {
    entreprise_id?: string;
    statut?: string;
    priorite?: string;
    secteur_activite?: string;
    zone_geo?: string;
    date_debut?: string;
    date_fin?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ demandes: Demande[], total: number }> {
    
    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;

    // Construction dynamique de la requête WHERE
    if (filters.entreprise_id) {
      whereConditions.push(`d.entreprise_id = $${paramIndex++}`);
      params.push(filters.entreprise_id);
    }

    if (filters.statut) {
      whereConditions.push(`d.statut = $${paramIndex++}`);
      params.push(filters.statut);
    }

    if (filters.priorite) {
      whereConditions.push(`d.priorite = $${paramIndex++}`);
      params.push(filters.priorite);
    }

    if (filters.secteur_activite) {
      whereConditions.push(`e.secteur_activite ILIKE $${paramIndex++}`);
      params.push(`%${filters.secteur_activite}%`);
    }

    if (filters.zone_geo) {
      whereConditions.push(`d.zone_geo ILIKE $${paramIndex++}`);
      params.push(`%${filters.zone_geo}%`);
    }

    if (filters.date_debut) {
      whereConditions.push(`d.date_creation >= $${paramIndex++}`);
      params.push(filters.date_debut);
    }

    if (filters.date_fin) {
      whereConditions.push(`d.date_creation <= $${paramIndex++}`);
      params.push(filters.date_fin);
    }

    if (filters.search) {
      whereConditions.push(`(
        d.titre ILIKE $${paramIndex} OR 
        d.description ILIKE $${paramIndex} OR 
        e.nom ILIKE $${paramIndex}
      )`);
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Pagination
    const { clause: paginationClause } = db.buildPaginationClause(filters.page, filters.limit);

    // Requête principale
    const demandesResult = await db.query(`
      SELECT 
        d.*,
        e.nom as entreprise_nom,
        e.secteur_activite,
        m.nom as metier_nom,
        (
          SELECT COUNT(*) 
          FROM "DemandeLycee" dl 
          WHERE dl.demande_id = d.id
        ) as nb_lycees_assignes
      FROM "Demande" d
      LEFT JOIN "Entreprise" e ON d.entreprise_id = e.id
      LEFT JOIN "Metier" m ON d.metier_id = m.id
      ${whereClause}
      ORDER BY d.date_creation DESC
      ${paginationClause}
    `, params);

    // Count total pour pagination
    const countResult = await db.query(`
      SELECT COUNT(*) as total
      FROM "Demande" d
      LEFT JOIN "Entreprise" e ON d.entreprise_id = e.id
      LEFT JOIN "Metier" m ON d.metier_id = m.id
      ${whereClause}
    `, params);

    return {
      demandes: demandesResult.rows,
      total: parseInt(countResult.rows[0].total)
    };
  }

  /**
   * Assigne des lycées à une demande
   */
  async assignLyceesToDemande(
    demandeId: string, 
    lyceeIds: string[], 
    userId: string,
    options?: { note?: string; auto_score?: boolean }
  ): Promise<void> {
    await db.transaction(async (client) => {
      for (const lyceeId of lyceeIds) {
        // Vérifier si déjà assigné
        const existingResult = await client.query(
          'SELECT id FROM "DemandeLycee" WHERE demande_id = $1 AND lycee_id = $2',
          [demandeId, lyceeId]
        );

        if (existingResult.rows.length === 0) {
          // Calculer le score et la distance si demandé
          let scoreMatching = null;
          let distanceKm = null;

          if (options?.auto_score) {
            // Ici on pourrait intégrer votre algorithme de matching existant
            // scoreMatching = await this.calculateMatchingScore(demandeId, lyceeId);
            // distanceKm = await this.calculateDistance(demandeId, lyceeId);
          }

          // Créer l'assignation
          await client.query(`
            INSERT INTO "DemandeLycee" (demande_id, lycee_id, note, score_matching, distance_km)
            VALUES ($1, $2, $3, $4, $5)
          `, [demandeId, lyceeId, options?.note || null, scoreMatching, distanceKm]);

          // Créer l'action
          await client.query(`
            INSERT INTO "Action" (demande_id, user_id, type_action, commentaire)
            VALUES ($1, $2, 'AFFECTATION', $3)
          `, [demandeId, userId, `Lycée assigné: ${lyceeId}`]);
        }
      }
    });
  }

  /**
   * Met à jour le statut d'une demande-lycée
   */
  async updateDemandeLyceeStatus(
    demandeLyceeId: string, 
    newStatus: string, 
    userId: string,
    note?: string
  ): Promise<boolean> {
    return await db.transaction(async (client) => {
      const updateData: any = { 
        statut_traitement: newStatus,
        user_traitement_id: userId,
        date_reponse: new Date()
      };

      if (note) {
        updateData.note = note;
      }

      const result = await client.query(`
        UPDATE "DemandeLycee" 
        SET statut_traitement = $1, user_traitement_id = $2, date_reponse = CURRENT_TIMESTAMP, note = COALESCE($3, note)
        WHERE id = $4
        RETURNING demande_id
      `, [newStatus, userId, note || null, demandeLyceeId]);

      if (result.rows.length > 0) {
        const demandeId = result.rows[0].demande_id;
        
        // Créer l'action
        await client.query(`
          INSERT INTO "Action" (demande_id, demande_lycee_id, user_id, type_action, commentaire)
          VALUES ($1, $2, $3, 'STATUT_CHANGE', $4)
        `, [demandeId, demandeLyceeId, userId, `Statut changé vers: ${newStatus}`]);

        return true;
      }

      return false;
    });
  }

  /**
   * Statistiques des demandes
   */
  async getDemandeStats(filters?: {
    entreprise_id?: string;
    date_debut?: string;
    date_fin?: string;
  }): Promise<DemandeStats> {
    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (filters?.entreprise_id) {
      whereConditions.push(`entreprise_id = $${paramIndex++}`);
      params.push(filters.entreprise_id);
    }

    if (filters?.date_debut) {
      whereConditions.push(`date_creation >= $${paramIndex++}`);
      params.push(filters.date_debut);
    }

    if (filters?.date_fin) {
      whereConditions.push(`date_creation <= $${paramIndex++}`);
      params.push(filters.date_fin);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Stats globales
    const statsResult = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN statut = 'EN_ATTENTE' THEN 1 END) as en_attente,
        COUNT(CASE WHEN statut = 'EN_COURS' THEN 1 END) as en_cours,
        COUNT(CASE WHEN statut = 'TRAITE' THEN 1 END) as traite,
        COUNT(CASE WHEN statut = 'ANNULE' THEN 1 END) as annule
      FROM "Demande"
      ${whereClause}
    `, params);

    // Stats par mois
    const monthlyResult = await db.query(`
      SELECT 
        TO_CHAR(date_creation, 'YYYY-MM') as mois,
        COUNT(*) as count
      FROM "Demande"
      ${whereClause}
      GROUP BY TO_CHAR(date_creation, 'YYYY-MM')
      ORDER BY mois DESC
      LIMIT 12
    `, params);

    const stats = statsResult.rows[0];
    
    return {
      total: parseInt(stats.total),
      en_attente: parseInt(stats.en_attente),
      en_cours: parseInt(stats.en_cours),
      traite: parseInt(stats.traite),
      annule: parseInt(stats.annule),
      par_mois: monthlyResult.rows
    };
  }

  /**
   * Récupère l'historique des actions pour une demande
   */
  async getDemandeActions(demandeId: string): Promise<any[]> {
    const result = await db.query(`
      SELECT 
        a.*,
        u.full_name as user_nom,
        u.role as user_role
      FROM "Action" a
      LEFT JOIN "User" u ON a.user_id = u.id
      WHERE a.demande_id = $1
      ORDER BY a.date_action DESC
    `, [demandeId]);

    return result.rows;
  }

  /**
   * Vérifie si une chaîne est un UUID valide
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Crée une entreprise temporaire avec les informations minimales
   */
  private async createTemporaryEntreprise(siret: string): Promise<string> {
    const entrepriseData = {
      nom: `Entreprise ${siret}`,
      siret: siret,
      siren: siret.substring(0, 9), // Les 9 premiers caractères du SIRET
      secteur_activite: 'Secteur non défini',
      adresse: 'Adresse non renseignée',
      code_postal: null,
      commune: null,
      departement: null,
      latitude: null,
      longitude: null
    };

    const entrepriseId = await db.insertAndReturnId('Entreprise', entrepriseData);
    console.log(`✅ Entreprise temporaire créée: ${siret} (ID: ${entrepriseId})`);
    return entrepriseId;
  }
}

export default new DemandeService();

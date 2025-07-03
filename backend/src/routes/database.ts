import express from 'express';
import demandeService from '../services/demandeService';
import syncService from '../services/syncService'; // Nouvelle import
import db from '../services/databaseService';
import { CreateDemandeRequest, UpdateDemandeRequest } from '../types/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// ================================
// ROUTES DE SYNCHRONISATION
// ================================

/**
 * POST /api/db/sync/lycees
 * Synchronise des lycées depuis l'API vers la base de données
 */
router.post('/sync/lycees', async (req, res) => {
  try {
    const searchParams = req.body; // Critères de recherche pour l'API lycées
    
    const lyceeIds = await syncService.syncLyceesFromSearch(searchParams);
    
    res.json({
      success: true,
      data: {
        synced_count: lyceeIds.length,
        lycee_ids: lyceeIds
      },
      message: `${lyceeIds.length} lycées synchronisés avec succès`
    });
  } catch (error) {
    console.error('Erreur sync lycées:', error);
    res.status(500).json({
      error: 'Erreur lors de la synchronisation des lycées',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * POST /api/db/sync/entreprise/:siret
 * Synchronise une entreprise depuis l'API SIRENE
 */
router.post('/sync/entreprise/:siret', async (req, res) => {
  try {
    const { siret } = req.params;
    
    const entrepriseId = await syncService.syncEntrepriseFromSiret(siret);
    
    if (!entrepriseId) {
      return res.status(404).json({
        error: 'Entreprise non trouvée',
        message: 'Aucune entreprise trouvée avec ce SIRET'
      });
    }
    
    res.json({
      success: true,
      data: { entreprise_id: entrepriseId },
      message: 'Entreprise synchronisée avec succès'
    });
  } catch (error) {
    console.error('Erreur sync entreprise:', error);
    res.status(500).json({
      error: 'Erreur lors de la synchronisation de l\'entreprise',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

// ================================
// ROUTES POUR LES DEMANDES
// ================================

/**
 * POST /api/db/demandes
 * Crée une nouvelle demande de partenariat
 */
router.post('/demandes', authenticateToken, async (req, res) => {
  try {
    const data: CreateDemandeRequest = req.body;
    const userId = (req as any).user.userId; // Utiliser l'utilisateur authentifié
    
    const demandeId = await demandeService.createDemande(data, userId);
    
    res.status(201).json({
      success: true,
      data: { id: demandeId },
      message: 'Demande créée avec succès'
    });
  } catch (error) {
    console.error('Erreur création demande:', error);
    res.status(500).json({
      error: 'Erreur lors de la création de la demande',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * GET /api/db/demandes
 * Recherche des demandes avec filtres
 */
router.get('/demandes', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user; // Utilisateur authentifié
    
    const filters = {
      entreprise_id: req.query.entreprise_id as string,
      statut: req.query.statut as string,
      priorite: req.query.priorite as string,
      secteur_activite: req.query.secteur_activite as string,
      zone_geo: req.query.zone_geo as string,
      date_debut: req.query.date_debut as string,
      date_fin: req.query.date_fin as string,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20
    };

    // Filtrer automatiquement selon le rôle de l'utilisateur
    if (user.role === 'ENTREPRISE_ADMIN' && user.entreprise_id) {
      filters.entreprise_id = user.entreprise_id;
    } else if (user.role === 'LYCEE_ADMIN' && user.lycee_id) {
      // Pour les lycées, on récupère les demandes qui leur sont assignées
      filters.lycee_id = user.lycee_id;
    }

    const result = await demandeService.searchDemandes(filters);
    
    res.json({
      success: true,
      data: result.demandes,
      pagination: {
        total: result.total,
        page: filters.page,
        limit: filters.limit,
        pages: Math.ceil(result.total / filters.limit)
      }
    });
  } catch (error) {
    console.error('Erreur recherche demandes:', error);
    res.status(500).json({
      error: 'Erreur lors de la recherche des demandes',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * GET /api/db/demandes/:id
 * Récupère une demande par ID
 */
router.get('/demandes/:id', async (req, res) => {
  try {
    const demande = await demandeService.getDemandeById(req.params.id);
    
    if (!demande) {
      return res.status(404).json({ error: 'Demande non trouvée' });
    }
    
    res.json({
      success: true,
      data: demande
    });
  } catch (error) {
    console.error('Erreur récupération demande:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération de la demande',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * PUT /api/db/demandes/:id
 * Met à jour une demande
 */
router.put('/demandes/:id', async (req, res) => {
  try {
    const data: UpdateDemandeRequest = req.body;
    const userId = req.headers['user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    const success = await demandeService.updateDemande(req.params.id, data, userId);
    
    if (!success) {
      return res.status(404).json({ error: 'Demande non trouvée' });
    }
    
    res.json({
      success: true,
      message: 'Demande mise à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur mise à jour demande:', error);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour de la demande',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * POST /api/db/demandes/:id/lycees
 * Assigne des lycées à une demande
 */
router.post('/demandes/:id/lycees', async (req, res) => {
  try {
    const { lycee_ids, note, auto_score } = req.body;
    const userId = req.headers['user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    if (!Array.isArray(lycee_ids) || lycee_ids.length === 0) {
      return res.status(400).json({ error: 'Liste des lycées requise' });
    }

    await demandeService.assignLyceesToDemande(
      req.params.id, 
      lycee_ids, 
      userId,
      { note, auto_score }
    );
    
    res.json({
      success: true,
      message: 'Lycées assignés avec succès'
    });
  } catch (error) {
    console.error('Erreur assignation lycées:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'assignation des lycées',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * PUT /api/db/demandes/lycees/:demandeLyceeId/status
 * Met à jour le statut d'une demande-lycée
 */
router.put('/demandes/lycees/:demandeLyceeId/status', async (req, res) => {
  try {
    const { statut, note } = req.body;
    const userId = req.headers['user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    if (!statut) {
      return res.status(400).json({ error: 'Statut requis' });
    }

    const success = await demandeService.updateDemandeLyceeStatus(
      req.params.demandeLyceeId,
      statut,
      userId,
      note
    );
    
    if (!success) {
      return res.status(404).json({ error: 'Demande-lycée non trouvée' });
    }
    
    res.json({
      success: true,
      message: 'Statut mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur mise à jour statut:', error);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour du statut',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * GET /api/db/demandes/:id/actions
 * Récupère l'historique des actions
 */
router.get('/demandes/:id/actions', async (req, res) => {
  try {
    const actions = await demandeService.getDemandeActions(req.params.id);
    
    res.json({
      success: true,
      data: actions
    });
  } catch (error) {
    console.error('Erreur récupération actions:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des actions',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * GET /api/db/stats/demandes
 * Statistiques des demandes
 */
router.get('/stats/demandes', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user; // Utilisateur authentifié
    
    const filters = {
      entreprise_id: req.query.entreprise_id as string,
      date_debut: req.query.date_debut as string,
      date_fin: req.query.date_fin as string
    };

    // Filtrer automatiquement selon le rôle de l'utilisateur
    if (user.role === 'ENTREPRISE_ADMIN' && user.entreprise_id) {
      filters.entreprise_id = user.entreprise_id;
    } else if (user.role === 'LYCEE_ADMIN' && user.lycee_id) {
      // Pour les lycées, on ajoute le filtrage par lycée
      (filters as any).lycee_id = user.lycee_id;
    }

    const stats = await demandeService.getDemandeStats(filters);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erreur statistiques demandes:', error);
    res.status(500).json({
      error: 'Erreur lors du calcul des statistiques',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

// ================================
// ROUTES POUR LES LYCÉES (BDD)
// ================================

/**
 * GET /api/db/lycees
 * Recherche des lycées dans la base de données
 */
router.get('/lycees', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, region, departement } = req.query;
    
    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(nom ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (region) {
      whereConditions.push(`region_id = (SELECT id FROM "Region" WHERE nom = $${paramIndex})`);
      params.push(region);
      paramIndex++;
    }

    if (departement) {
      whereConditions.push(`departement = $${paramIndex}`);
      params.push(departement);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const { clause: paginationClause } = db.buildPaginationClause(Number(page), Number(limit));

    const lyceesResult = await db.query(`
      SELECT 
        l.*,
        r.nom as region_nom,
        (
          SELECT COUNT(*) 
          FROM "Formation" f 
          WHERE f.lycee_id = l.id
        ) as nb_formations
      FROM "Lycee" l
      LEFT JOIN "Region" r ON l.region_id = r.id
      ${whereClause}
      ORDER BY l.nom
      ${paginationClause}
    `, params);

    const countResult = await db.query(`
      SELECT COUNT(*) as total
      FROM "Lycee" l
      ${whereClause}
    `, params);

    res.json({
      success: true,
      data: lyceesResult.rows,
      pagination: {
        total: parseInt(countResult.rows[0].total),
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(parseInt(countResult.rows[0].total) / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erreur recherche lycées BDD:', error);
    res.status(500).json({
      error: 'Erreur lors de la recherche des lycées',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * GET /api/db/lycees/:id
 * Récupère un lycée avec ses formations
 */
router.get('/lycees/:id', async (req, res) => {
  try {
    const lyceeResult = await db.query(`
      SELECT 
        l.*,
        r.nom as region_nom
      FROM "Lycee" l
      LEFT JOIN "Region" r ON l.region_id = r.id
      WHERE l.id = $1
    `, [req.params.id]);

    if (lyceeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lycée non trouvé' });
    }

    const lycee = lyceeResult.rows[0];

    // Récupérer les formations
    const formationsResult = await db.query(`
      SELECT 
        f.*,
        d.nom as domaine_nom,
        m.nom as metier_nom
      FROM "Formation" f
      LEFT JOIN "Domaine" d ON f.domaine_id = d.id
      LEFT JOIN "Metier" m ON f.metier_id = m.id
      WHERE f.lycee_id = $1
      ORDER BY f.intitule
    `, [req.params.id]);

    // Récupérer les plateaux techniques
    const plateauxResult = await db.query(`
      SELECT * FROM "PlateauTechnique"
      WHERE lycee_id = $1
      ORDER BY nom
    `, [req.params.id]);

    res.json({
      success: true,
      data: {
        ...lycee,
        formations: formationsResult.rows,
        plateaux_techniques: plateauxResult.rows
      }
    });
  } catch (error) {
    console.error('Erreur récupération lycée:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du lycée',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

// ================================
// ROUTES POUR LES ENTREPRISES (BDD)
// ================================

/**
 * GET /api/db/entreprises
 * Liste des entreprises
 */
router.get('/entreprises', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, secteur } = req.query;
    
    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(nom ILIKE $${paramIndex} OR siret ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (secteur) {
      whereConditions.push(`secteur_activite ILIKE $${paramIndex}`);
      params.push(`%${secteur}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const { clause: paginationClause } = db.buildPaginationClause(Number(page), Number(limit));

    const entreprisesResult = await db.query(`
      SELECT 
        e.*,
        (
          SELECT COUNT(*) 
          FROM "Demande" d 
          WHERE d.entreprise_id = e.id
        ) as nb_demandes
      FROM "Entreprise" e
      ${whereClause}
      ORDER BY e.nom
      ${paginationClause}
    `, params);

    const countResult = await db.query(`
      SELECT COUNT(*) as total
      FROM "Entreprise" e
      ${whereClause}
    `, params);

    res.json({
      success: true,
      data: entreprisesResult.rows,
      pagination: {
        total: parseInt(countResult.rows[0].total),
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(parseInt(countResult.rows[0].total) / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erreur recherche entreprises:', error);
    res.status(500).json({
      error: 'Erreur lors de la recherche des entreprises',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

// ================================
// ROUTES UTILITAIRES
// ================================

/**
 * GET /api/db/regions
 * Liste des régions
 */
router.get('/regions', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM "Region" ORDER BY nom');
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur récupération régions:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des régions',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * GET /api/db/domaines
 * Liste des domaines
 */
router.get('/domaines', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM "Domaine" ORDER BY nom');
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur récupération domaines:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des domaines',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * GET /api/db/metiers
 * Liste des métiers par domaine
 */
router.get('/metiers', async (req, res) => {
  try {
    const { domaine_id } = req.query;
    
    let whereClause = '';
    let params: any[] = [];
    
    if (domaine_id) {
      whereClause = 'WHERE m.domaine_id = $1';
      params.push(domaine_id);
    }

    const result = await db.query(`
      SELECT 
        m.*,
        d.nom as domaine_nom
      FROM "Metier" m
      LEFT JOIN "Domaine" d ON m.domaine_id = d.id
      ${whereClause}
      ORDER BY d.nom, m.nom
    `, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur récupération métiers:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des métiers',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

export default router;

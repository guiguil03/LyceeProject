import express from 'express';
import DemandeServicePrisma from '../services/demandeServicePrisma';
import syncService from '../services/syncService';
import PrismaService from '../services/prismaService';
import { CreateDemandeRequest, UpdateDemandeRequest } from '../types/database';

const router = express.Router();

// Instance du service Prisma
const demandeService = new DemandeServicePrisma();
const prisma = PrismaService.getInstance().getClient();

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
router.post('/demandes', async (req, res) => {
  try {
    const rawData: CreateDemandeRequest = req.body;
    const userId = req.headers['user-id'] as string; // À adapter selon votre système d'auth
    
    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    // Convertir les dates string en objets Date
    const data = {
      ...rawData,
      date_debut_souhaitee: rawData.date_debut_souhaitee ? new Date(rawData.date_debut_souhaitee) : undefined,
      date_fin_souhaitee: rawData.date_fin_souhaitee ? new Date(rawData.date_fin_souhaitee) : undefined
    };

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
router.get('/demandes', async (req, res) => {
  try {
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
    const rawData: UpdateDemandeRequest = req.body;
    const userId = req.headers['user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    // Convertir les dates string en objets Date
    const data = {
      ...rawData,
      date_debut_souhaitee: rawData.date_debut_souhaitee ? new Date(rawData.date_debut_souhaitee) : undefined,
      date_fin_souhaitee: rawData.date_fin_souhaitee ? new Date(rawData.date_fin_souhaitee) : undefined
    };

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
router.get('/stats/demandes', async (req, res) => {
  try {
    const filters = {
      entreprise_id: req.query.entreprise_id as string,
      date_debut: req.query.date_debut as string,
      date_fin: req.query.date_fin as string
    };

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
 * Liste des lycées avec filtres
 */
router.get('/lycees', async (req, res) => {
  try {
    const { page = 1, limit = 20, region, departement, search } = req.query;
    
    const pageNum = Number(page);
    const limitNum = Math.min(Number(limit), 100); // Maximum 100 résultats
    const skip = (pageNum - 1) * limitNum;

    // Construction des filtres Prisma
    const where: any = {};
    
    if (region) {
      where.region = { nom: { contains: region as string, mode: 'insensitive' } };
    }
    
    if (departement) {
      where.departement = departement as string;
    }
    
    if (search) {
      where.OR = [
        { nom: { contains: search as string, mode: 'insensitive' } },
        { commune: { contains: search as string, mode: 'insensitive' } },
        { numeroUai: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Récupération des lycées avec comptage des formations
    const [lycees, total] = await Promise.all([
      prisma.lycee.findMany({
        where,
        include: {
          region: { select: { nom: true } },
          formations: { select: { id: true } }
        },
        orderBy: { nom: 'asc' },
        skip,
        take: limitNum
      }),
      prisma.lycee.count({ where })
    ]);

    // Transformation des données pour correspondre à l'ancien format
    const lyceesWithCount = lycees.map((lycee: any) => ({
      ...lycee,
      region_nom: lycee.region?.nom || null,
      nb_formations: lycee.formations.length
    }));

    res.json({
      success: true,
      data: lyceesWithCount,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
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
    const lycee = await prisma.lycee.findUnique({
      where: { id: req.params.id },
      include: {
        region: { select: { nom: true } },
        formations: {
          include: {
            domaine: { select: { nom: true } },
            metier: { select: { nom: true } }
          },
          orderBy: { intitule: 'asc' }
        },
        plateauxTechniques: {
          orderBy: { nom: 'asc' }
        }
      }
    });

    if (!lycee) {
      return res.status(404).json({ error: 'Lycée non trouvé' });
    }

    // Transformation des données pour correspondre à l'ancien format
    const response = {
      ...lycee,
      region_nom: lycee.region?.nom || null,
      formations: lycee.formations.map((f: any) => ({
        ...f,
        domaine_nom: f.domaine?.nom || null,
        metier_nom: f.metier?.nom || null
      })),
      plateaux_techniques: lycee.plateauxTechniques
    };

    res.json({
      success: true,
      data: response
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
    
    const pageNum = Number(page);
    const limitNum = Math.min(Number(limit), 100);
    const skip = (pageNum - 1) * limitNum;

    // Construction des filtres Prisma
    const where: any = {};
    
    if (search) {
      where.OR = [
        { nom: { contains: search as string, mode: 'insensitive' } },
        { siret: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    
    if (secteur) {
      where.secteurActivite = { contains: secteur as string, mode: 'insensitive' };
    }

    // Récupération des entreprises avec comptage des demandes
    const [entreprises, total] = await Promise.all([
      prisma.entreprise.findMany({
        where,
        include: {
          demandes: { select: { id: true } }
        },
        orderBy: { nom: 'asc' },
        skip,
        take: limitNum
      }),
      prisma.entreprise.count({ where })
    ]);

    // Transformation des données pour correspondre à l'ancien format
    const entreprisesWithCount = entreprises.map((entreprise: any) => ({
      ...entreprise,
      nb_demandes: entreprise.demandes.length
    }));

    res.json({
      success: true,
      data: entreprisesWithCount,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
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
    const regions = await prisma.region.findMany({
      orderBy: { nom: 'asc' }
    });
    
    res.json({
      success: true,
      data: regions
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
    const domaines = await prisma.domaine.findMany({
      orderBy: { nom: 'asc' }
    });
    
    res.json({
      success: true,
      data: domaines
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
    
    const where: any = {};
    if (domaine_id) {
      where.domaineId = domaine_id as string;
    }

    const metiers = await prisma.metier.findMany({
      where,
      include: {
        domaine: { select: { nom: true } }
      },
      orderBy: [
        { domaine: { nom: 'asc' } },
        { nom: 'asc' }
      ]
    });

    // Transformation des données pour correspondre à l'ancien format
    const metiersWithDomaine = metiers.map((metier: any) => ({
      ...metier,
      domaine_nom: metier.domaine?.nom || null
    }));
    
    res.json({
      success: true,
      data: metiersWithDomaine
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

import PrismaService from './prismaService';
import { PrismaClient, Demande, DemandeLycee, User, Entreprise, Lycee, Metier, Domaine } from '@prisma/client';
import bcrypt from 'bcryptjs';

interface CreateDemandeRequest {
  entreprise_id: string;
  metier_id?: string;
  titre: string;
  description?: string;
  type_partenariat?: string;
  zone_geo?: string;
  nb_places?: number;
  date_debut_souhaitee?: Date;
  date_fin_souhaitee?: Date;
  priorite?: string;
}

interface UpdateDemandeRequest {
  titre?: string;
  description?: string;
  type_partenariat?: string;
  zone_geo?: string;
  nb_places?: number;
  date_debut_souhaitee?: Date;
  date_fin_souhaitee?: Date;
  statut?: string;
  priorite?: string;
}

interface DemandeStats {
  total: number;
  en_attente: number;
  en_cours: number;
  traite: number;
  annule: number;
  par_mois: Array<{
    mois: string;
    count: number;
  }>;
}

interface SearchFilters {
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
}

class DemandeServicePrisma {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = PrismaService.getInstance().getClient();
  }

  /**
   * Crée une nouvelle demande de partenariat
   */
  async createDemande(data: CreateDemandeRequest, userId?: string): Promise<string> {
    return await this.prisma.$transaction(async (tx) => {
      console.log('DemandeServicePrisma.createDemande - Données reçues:', JSON.stringify(data, null, 2));
      console.log('DemandeServicePrisma.createDemande - UserId reçu:', userId);
      
      let entrepriseId = data.entreprise_id;
      
      if (!data.entreprise_id) {
        throw new Error('entreprise_id est requis');
      }
      
      // Si ce n'est pas un UUID (format SIRET probable), créer ou récupérer l'entreprise
      if (!this.isValidUUID(data.entreprise_id)) {
        const siret = data.entreprise_id;
        
        // Chercher une entreprise existante avec ce SIRET
        const existingEntreprise = await tx.entreprise.findUnique({
          where: { siret: siret }
        });
        
        if (existingEntreprise) {
          entrepriseId = existingEntreprise.id;
        } else {
          // Créer une entreprise temporaire
          const newEntreprise = await tx.entreprise.create({
            data: {
              nom: `Entreprise ${siret}`,
              siret: siret,
              secteurActivite: 'Non spécifié'
            }
          });
          entrepriseId = newEntreprise.id;
        }
      }

      // Créer la demande
      const demande = await tx.demande.create({
        data: {
          entrepriseId: entrepriseId,
          metierId: data.metier_id,
          titre: data.titre,
          description: data.description,
          typePartenariat: data.type_partenariat,
          zoneGeo: data.zone_geo,
          nbPlaces: data.nb_places,
          dateDebutSouhaitee: data.date_debut_souhaitee,
          dateFinSouhaitee: data.date_fin_souhaitee,
          statut: 'EN_ATTENTE',
          priorite: data.priorite || 'NORMALE'
        }
      });

      // Créer l'action de création si userId est fourni et valide
      if (userId && this.isValidUUID(userId)) {
        try {
          await tx.action.create({
            data: {
              demandeId: demande.id,
              userId: userId,
              typeAction: 'CREATION',
              commentaire: 'Demande créée'
            }
          });
        } catch (error) {
          console.warn('Impossible de créer l\'action (utilisateur invalide):', error);
        }
      }

      return demande.id;
    });
  }

  /**
   * Récupère une demande par ID avec ses relations
   */
  async getDemandeById(id: string): Promise<any | null> {
    const demande = await this.prisma.demande.findUnique({
      where: { id },
      include: {
        entreprise: true,
        metier: {
          include: {
            domaine: true
          }
        },
        demandeLycees: {
          include: {
            lycee: true,
            userTraitement: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          },
          orderBy: [
            { scoreMatching: 'desc' },
            { distanceKm: 'asc' }
          ]
        }
      }
    });

    if (!demande) return null;

    // Transformer pour correspondre à l'ancien format
    return {
      ...demande,
      entreprise_nom: demande.entreprise.nom,
      secteur_activite: demande.entreprise.secteurActivite,
      metier_nom: demande.metier?.nom,
      domaine_nom: demande.metier?.domaine?.nom,
      lycees: demande.demandeLycees.map(dl => ({
        ...dl,
        lycee_nom: dl.lycee.nom,
        lycee_adresse: dl.lycee.adresse,
        user_traitement_nom: dl.userTraitement?.fullName
      }))
    };
  }

  /**
   * Met à jour une demande
   */
  async updateDemande(id: string, data: UpdateDemandeRequest, userId: string): Promise<boolean> {
    return await this.prisma.$transaction(async (tx) => {
      // Récupérer l'état actuel
      const currentDemande = await tx.demande.findUnique({
        where: { id }
      });
      
      if (!currentDemande) return false;
      
      // Mettre à jour
      const updatedDemande = await tx.demande.update({
        where: { id },
        data: {
          titre: data.titre,
          description: data.description,
          typePartenariat: data.type_partenariat,
          zoneGeo: data.zone_geo,
          nbPlaces: data.nb_places,
          dateDebutSouhaitee: data.date_debut_souhaitee,
          dateFinSouhaitee: data.date_fin_souhaitee,
          statut: data.statut,
          priorite: data.priorite
        }
      });
      
      // Créer l'action de modification
      await tx.action.create({
        data: {
          demandeId: id,
          userId: userId,
          typeAction: 'MODIFICATION',
          commentaire: 'Demande modifiée',
          donneesAvant: currentDemande as any,
          donneesApres: data as any
        }
      });
      
      return true;
    });
  }

  /**
   * Recherche des demandes avec filtres
   */
  async searchDemandes(filters: SearchFilters): Promise<{ demandes: any[], total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    // Construction des filtres WHERE
    const where: any = {};

    if (filters.entreprise_id) {
      where.entrepriseId = filters.entreprise_id;
    }

    if (filters.statut) {
      where.statut = filters.statut;
    }

    if (filters.priorite) {
      where.priorite = filters.priorite;
    }

    if (filters.secteur_activite) {
      where.entreprise = {
        secteurActivite: {
          contains: filters.secteur_activite,
          mode: 'insensitive'
        }
      };
    }

    if (filters.zone_geo) {
      where.zoneGeo = {
        contains: filters.zone_geo,
        mode: 'insensitive'
      };
    }

    if (filters.date_debut || filters.date_fin) {
      where.dateCreation = {};
      if (filters.date_debut) {
        where.dateCreation.gte = new Date(filters.date_debut);
      }
      if (filters.date_fin) {
        where.dateCreation.lte = new Date(filters.date_fin);
      }
    }

    if (filters.search) {
      where.OR = [
        { titre: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { entreprise: { nom: { contains: filters.search, mode: 'insensitive' } } }
      ];
    }

    // Compter le total
    const total = await this.prisma.demande.count({ where });

    // Récupérer les demandes
    const demandes = await this.prisma.demande.findMany({
      where,
      include: {
        entreprise: {
          select: {
            nom: true,
            secteurActivite: true
          }
        },
        metier: {
          select: {
            nom: true
          }
        }
      },
      orderBy: [
        { priorite: 'desc' },
        { dateCreation: 'desc' }
      ],
      skip,
      take: limit
    });

    return {
      demandes: demandes.map(d => ({
        ...d,
        entreprise_nom: d.entreprise.nom,
        secteur_activite: d.entreprise.secteurActivite,
        metier_nom: d.metier?.nom
      })),
      total
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
    await this.prisma.$transaction(async (tx) => {
      // Créer les associations demande-lycée
      for (const lyceeId of lyceeIds) {
        await tx.demandeLycee.upsert({
          where: {
            demandeId_lyceeId: {
              demandeId,
              lyceeId
            }
          },
          create: {
            demandeId,
            lyceeId,
            note: options?.note,
            scoreMatching: options?.auto_score ? Math.random() : undefined, // Score temporaire
            userTraitementId: userId
          },
          update: {
            note: options?.note,
            userTraitementId: userId
          }
        });
      }

      // Créer l'action d'affectation
      await tx.action.create({
        data: {
          demandeId,
          userId,
          typeAction: 'AFFECTATION',
          commentaire: `Affectation à ${lyceeIds.length} lycée(s)`
        }
      });
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
    return await this.prisma.$transaction(async (tx) => {
      const demandeLycee = await tx.demandeLycee.findUnique({
        where: { id: demandeLyceeId }
      });

      if (!demandeLycee) return false;

      await tx.demandeLycee.update({
        where: { id: demandeLyceeId },
        data: {
          statutTraitement: newStatus,
          note: note || demandeLycee.note,
          dateReponse: new Date(),
          userTraitementId: userId
        }
      });

      // Créer l'action de changement de statut
      await tx.action.create({
        data: {
          demandeLyceeId: demandeLyceeId,
          userId,
          typeAction: 'STATUT_CHANGE',
          commentaire: `Statut changé vers: ${newStatus}`
        }
      });

      return true;
    });
  }

  /**
   * Récupère les statistiques des demandes
   */
  async getDemandeStats(filters?: {
    entreprise_id?: string;
    date_debut?: string;
    date_fin?: string;
  }): Promise<DemandeStats> {
    const where: any = {};

    if (filters?.entreprise_id) {
      where.entrepriseId = filters.entreprise_id;
    }

    if (filters?.date_debut || filters?.date_fin) {
      where.dateCreation = {};
      if (filters.date_debut) {
        where.dateCreation.gte = new Date(filters.date_debut);
      }
      if (filters.date_fin) {
        where.dateCreation.lte = new Date(filters.date_fin);
      }
    }

    const [total, en_attente, en_cours, traite, annule] = await Promise.all([
      this.prisma.demande.count({ where }),
      this.prisma.demande.count({ where: { ...where, statut: 'EN_ATTENTE' } }),
      this.prisma.demande.count({ where: { ...where, statut: 'EN_COURS' } }),
      this.prisma.demande.count({ where: { ...where, statut: 'TRAITE' } }),
      this.prisma.demande.count({ where: { ...where, statut: 'ANNULE' } })
    ]);

    // Calculer les stats par mois pour les 12 derniers mois
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Créer les conditions pour la requête mensuelle
    const monthlyWhere = { ...where };
    if (!monthlyWhere.dateCreation) {
      monthlyWhere.dateCreation = {};
    }
    if (!monthlyWhere.dateCreation.gte) {
      monthlyWhere.dateCreation.gte = twelveMonthsAgo;
    }

    // Récupérer toutes les demandes des 12 derniers mois
    const demandesForMonths = await this.prisma.demande.findMany({
      where: monthlyWhere,
      select: {
        dateCreation: true
      }
    });

    // Grouper par mois
    const monthlyCount = new Map<string, number>();
    demandesForMonths.forEach(demande => {
      if (demande.dateCreation) {
        const monthStr = demande.dateCreation.toISOString().slice(0, 7); // Format YYYY-MM
        monthlyCount.set(monthStr, (monthlyCount.get(monthStr) || 0) + 1);
      }
    });

    // Générer tous les mois des 12 derniers mois
    const allMonths: Array<{ mois: string; count: number }> = [];
    const currentDate = new Date(twelveMonthsAgo);
    
    while (currentDate < new Date()) {
      const monthStr = currentDate.toISOString().slice(0, 7); // Format YYYY-MM
      allMonths.push({
        mois: monthStr,
        count: monthlyCount.get(monthStr) || 0
      });
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return {
      total,
      en_attente,
      en_cours,
      traite,
      annule,
      par_mois: allMonths
    };
  }

  /**
   * Récupère les actions d'une demande
   */
  async getDemandeActions(demandeId: string): Promise<any[]> {
    const actions = await this.prisma.action.findMany({
      where: {
        OR: [
          { demandeId },
          { demandeLycee: { demandeId } }
        ]
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true
          }
        },
        demandeLycee: {
          include: {
            lycee: {
              select: {
                nom: true
              }
            }
          }
        }
      },
      orderBy: {
        dateAction: 'desc'
      }
    });

    return actions.map(action => ({
      ...action,
      user_nom: action.user.fullName,
      user_email: action.user.email,
      lycee_nom: action.demandeLycee?.lycee?.nom
    }));
  }

  /**
   * Vérifie si une chaîne est un UUID valide
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}

export default DemandeServicePrisma;
import PrismaService from './prismaService';
import lyceeService from './lyceeService';
import siretService from './siretService';
import { Lycee, Entreprise } from '../types/database';

class SyncService {
  private prisma = PrismaService.getInstance().getClient();

  /**
   * Synchronise un lycée depuis l'API vers la base de données
   */
  async syncLyceeFromAPI(lyceeAPI: any): Promise<string> {
    try {
      // Vérifier si le lycée existe déjà
      const existingLycee = await this.prisma.lycee.findFirst({
        where: {
          OR: [
            { numeroUai: lyceeAPI.numero_uai },
            { nom: lyceeAPI.nom_etablissement }
          ]
        }
      });

      if (existingLycee) {
        // Mettre à jour le lycée existant
        await this.updateLyceeFromAPI(existingLycee.id, lyceeAPI);
        return existingLycee.id;
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
      let region = await this.prisma.region.findUnique({
        where: { nom: lyceeAPI.libelle_region }
      });
      
      if (!region) {
        // Créer la région si elle n'existe pas
        region = await this.prisma.region.create({
          data: { nom: lyceeAPI.libelle_region }
        });
      }
      regionId = region.id;
    }

    // Créer le lycée
    const lycee = await this.prisma.lycee.create({
      data: {
        nom: lyceeAPI.nom_etablissement,
        numeroUai: lyceeAPI.numero_uai,
        typeEtablissement: lyceeAPI.type_etablissement,
        statutPublicPrive: lyceeAPI.statut_public_prive,
        adresse: lyceeAPI.adresse_1,
        codePostal: lyceeAPI.code_postal_uai,
        commune: lyceeAPI.libelle_commune,
        departement: lyceeAPI.libelle_departement,
        regionId: regionId,
        latitude: lyceeAPI.latitude ? parseFloat(lyceeAPI.latitude) : null,
        longitude: lyceeAPI.longitude ? parseFloat(lyceeAPI.longitude) : null,
        telephone: lyceeAPI.telephone,
        email: lyceeAPI.mail,
        siteWeb: lyceeAPI.web
      }
    });

    // Synchroniser les formations si disponibles
    if (lyceeAPI.formations && Array.isArray(lyceeAPI.formations)) {
      await this.syncFormations(lycee.id, lyceeAPI.formations);
    }

    console.log(`✅ Lycée synchronisé: ${lyceeAPI.nom_etablissement} (ID: ${lycee.id})`);
    return lycee.id;
  }

  /**
   * Met à jour un lycée existant
   */
  private async updateLyceeFromAPI(lyceeId: string, lyceeAPI: any): Promise<void> {
    await this.prisma.lycee.update({
      where: { id: lyceeId },
      data: {
        nom: lyceeAPI.nom_etablissement,
        numeroUai: lyceeAPI.numero_uai,
        typeEtablissement: lyceeAPI.type_etablissement,
        statutPublicPrive: lyceeAPI.statut_public_prive,
        adresse: lyceeAPI.adresse_1,
        codePostal: lyceeAPI.code_postal_uai,
        commune: lyceeAPI.libelle_commune,
        departement: lyceeAPI.libelle_departement,
        latitude: lyceeAPI.latitude ? parseFloat(lyceeAPI.latitude) : null,
        longitude: lyceeAPI.longitude ? parseFloat(lyceeAPI.longitude) : null,
        telephone: lyceeAPI.telephone,
        email: lyceeAPI.mail,
        siteWeb: lyceeAPI.web,
        updatedAt: new Date()
      }
    });
    
    console.log(`🔄 Lycée mis à jour: ${lyceeAPI.nom_etablissement}`);
  }

  /**
   * Synchronise une entreprise depuis l'API SIRENE vers la base
   */
  async syncEntrepriseFromAPI(entrepriseAPI: any): Promise<string> {
    try {
      // Vérifier si l'entreprise existe déjà
      const existingEntreprise = await this.prisma.entreprise.findUnique({
        where: { siret: entrepriseAPI.siret }
      });

      if (existingEntreprise) {
        // Mettre à jour l'entreprise existante
        await this.updateEntrepriseFromAPI(existingEntreprise.id, entrepriseAPI);
        return existingEntreprise.id;
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
    const entreprise = await this.prisma.entreprise.create({
      data: {
        nom: entrepriseAPI.denominationSociale,
        siret: entrepriseAPI.siret,
        siren: entrepriseAPI.siren,
        secteurActivite: entrepriseAPI.secteurActivite,
        adresse: `${entrepriseAPI.adresse?.numeroVoie || ''} ${entrepriseAPI.adresse?.typeVoie || ''} ${entrepriseAPI.adresse?.libelleVoie || ''}`.trim(),
        codePostal: entrepriseAPI.adresse?.codePostal,
        commune: entrepriseAPI.adresse?.commune,
        departement: entrepriseAPI.adresse?.departement,
        latitude: entrepriseAPI.coordonnees?.latitude ? parseFloat(entrepriseAPI.coordonnees.latitude) : null,
        longitude: entrepriseAPI.coordonnees?.longitude ? parseFloat(entrepriseAPI.coordonnees.longitude) : null
      }
    });

    console.log(`✅ Entreprise synchronisée: ${entrepriseAPI.denominationSociale} (ID: ${entreprise.id})`);
    return entreprise.id;
  }

  /**
   * Met à jour une entreprise existante
   */
  private async updateEntrepriseFromAPI(entrepriseId: string, entrepriseAPI: any): Promise<void> {
    await this.prisma.entreprise.update({
      where: { id: entrepriseId },
      data: {
        nom: entrepriseAPI.denominationSociale,
        secteurActivite: entrepriseAPI.secteurActivite,
        adresse: `${entrepriseAPI.adresse?.numeroVoie || ''} ${entrepriseAPI.adresse?.typeVoie || ''} ${entrepriseAPI.adresse?.libelleVoie || ''}`.trim(),
        codePostal: entrepriseAPI.adresse?.codePostal,
        commune: entrepriseAPI.adresse?.commune,
        departement: entrepriseAPI.adresse?.departement,
        latitude: entrepriseAPI.coordonnees?.latitude ? parseFloat(entrepriseAPI.coordonnees.latitude) : null,
        longitude: entrepriseAPI.coordonnees?.longitude ? parseFloat(entrepriseAPI.coordonnees.longitude) : null,
        updatedAt: new Date()
      }
    });

    console.log(`🔄 Entreprise mise à jour: ${entrepriseAPI.denominationSociale}`);
  }

  /**
   * Synchronise les formations d'un lycée
   */
  private async syncFormations(lyceeId: string, formations: string[]): Promise<void> {
    for (const formationNom of formations) {
      if (!formationNom || formationNom.trim() === '') continue;

      // Vérifier si la formation existe déjà pour ce lycée
      const existingFormation = await this.prisma.formation.findFirst({
        where: {
          lyceeId: lyceeId,
          intitule: formationNom.trim()
        }
      });

      if (!existingFormation) {
        // Essayer de déterminer le domaine et métier
        const { domaineId, metierId } = await this.inferDomaineMetier(formationNom);

        await this.prisma.formation.create({
          data: {
            lyceeId: lyceeId,
            intitule: formationNom.trim(),
            domaineId: domaineId,
            metierId: metierId
          }
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
    const domaines = await this.prisma.domaine.findMany();
    const metiers = await this.prisma.metier.findMany({
      include: { domaine: true }
    });

    let domaineId = null;
    let metierId = null;

    // Recherche par mots-clés dans les domaines
    for (const domaine of domaines) {
      const motsCles = this.getMotsClesDomaine(domaine.nom);
      if (motsCles.some(mot => formationLower.includes(mot))) {
        domaineId = domaine.id;
        break;
      }
    }

    // Recherche par mots-clés dans les métiers
    for (const metier of metiers) {
      const motsCles = metier.nom.toLowerCase().split(' ');
      if (motsCles.some((mot: string) => formationLower.includes(mot)) || formationLower.includes(metier.nom.toLowerCase())) {
        metierId = metier.id;
        if (!domaineId) {
          domaineId = metier.domaineId;
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

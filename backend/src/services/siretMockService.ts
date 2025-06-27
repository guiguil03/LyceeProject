import { Entreprise } from './siretService';

/**
 * Service mock pour les données Sirene en cas d'indisponibilité de l'API
 */
class SiretMockService {
  private mockEntreprises: { [siret: string]: Entreprise } = {
    '78467169500015': {
      siret: '78467169500015',
      siren: '784671695',
      denominationSociale: 'TechSolutions Paris',
      secteurActivite: 'informatique',
      codeAPE: '6202A',
      libelleAPE: 'Conseil en systèmes et logiciels informatiques',
      adresse: {
        numeroVoie: '42',
        typeVoie: 'RUE',
        libelleVoie: 'DES ENTREPRENEURS',
        codePostal: '75015',
        commune: 'Paris',
        departement: 'Paris',
        region: 'Île-de-France'
      },
      coordonnees: {
        latitude: 48.8566,
        longitude: 2.3522
      },
      effectifSalarie: '50',
      trancheEffectif: '50-99',
      dateCreation: '2015-03-15',
      statutJuridique: 'SAS',
      etatAdministratif: 'A'
    },
    '12345678901234': {
      siret: '12345678901234',
      siren: '123456789',
      denominationSociale: 'CommerceMax SARL',
      secteurActivite: 'commerce',
      codeAPE: '4791A',
      libelleAPE: 'Vente à distance sur catalogue général',
      adresse: {
        numeroVoie: '15',
        typeVoie: 'AVENUE',
        libelleVoie: 'DU COMMERCE',
        codePostal: '77100',
        commune: 'Meaux',
        departement: 'Seine-et-Marne',
        region: 'Île-de-France'
      },
      coordonnees: {
        latitude: 48.9598,
        longitude: 2.8877
      },
      effectifSalarie: '25',
      trancheEffectif: '20-49',
      dateCreation: '2018-07-22',
      statutJuridique: 'SARL',
      etatAdministratif: 'A'
    },
    '98765432109876': {
      siret: '98765432109876',
      siren: '987654321',
      denominationSociale: 'Bâtiment Expert',
      secteurActivite: 'batiment',
      codeAPE: '4331Z',
      libelleAPE: 'Travaux de plâtrerie',
      adresse: {
        numeroVoie: '8',
        typeVoie: 'IMPASSE',
        libelleVoie: 'DES ARTISANS',
        codePostal: '77200',
        commune: 'Torcy',
        departement: 'Seine-et-Marne',
        region: 'Île-de-France'
      },
      coordonnees: {
        latitude: 48.8489,
        longitude: 2.6536
      },
      effectifSalarie: '12',
      trancheEffectif: '10-19',
      dateCreation: '2020-01-10',
      statutJuridique: 'EURL',
      etatAdministratif: 'A'
    }
  };

  /**
   * Génère une entreprise mock basée sur le SIRET
   */
  generateMockEntreprise(siret: string): Entreprise {
    // Si l'entreprise existe dans nos mocks, la retourner
    if (this.mockEntreprises[siret]) {
      return this.mockEntreprises[siret];
    }

    // Sinon, générer une entreprise basique
    const secteurs = ['informatique', 'commerce', 'industrie', 'batiment', 'restauration'];
    const villes = [
      { nom: 'Paris', cp: '75000', dept: 'Paris', lat: 48.8566, lng: 2.3522 },
      { nom: 'Meaux', cp: '77100', dept: 'Seine-et-Marne', lat: 48.9598, lng: 2.8877 },
      { nom: 'Melun', cp: '77000', dept: 'Seine-et-Marne', lat: 48.5394, lng: 2.6556 },
      { nom: 'Torcy', cp: '77200', dept: 'Seine-et-Marne', lat: 48.8489, lng: 2.6536 }
    ];

    const secteurIndex = parseInt(siret.slice(-1)) % secteurs.length;
    const villeIndex = parseInt(siret.slice(-2, -1)) % villes.length;
    const ville = villes[villeIndex];
    const secteur = secteurs[secteurIndex];

    return {
      siret,
      siren: siret.substring(0, 9),
      denominationSociale: `Entreprise Demo ${siret.slice(-4)}`,
      secteurActivite: secteur,
      codeAPE: this.getCodeAPEBySecteur(secteur),
      libelleAPE: this.getLibelleAPEBySecteur(secteur),
      adresse: {
        numeroVoie: (parseInt(siret.slice(-3, -1)) % 99 + 1).toString(),
        typeVoie: 'RUE',
        libelleVoie: 'DE LA DEMONSTRATION',
        codePostal: ville.cp,
        commune: ville.nom,
        departement: ville.dept,
        region: 'Île-de-France'
      },
      coordonnees: {
        latitude: ville.lat,
        longitude: ville.lng
      },
      effectifSalarie: (parseInt(siret.slice(-2)) % 50 + 1).toString(),
      trancheEffectif: '1-49',
      dateCreation: '2020-01-01',
      statutJuridique: 'SAS',
      etatAdministratif: 'A'
    };
  }

  private getCodeAPEBySecteur(secteur: string): string {
    const codes: { [key: string]: string } = {
      'informatique': '6202A',
      'commerce': '4791A',
      'industrie': '2562B',
      'batiment': '4331Z',
      'restauration': '5610A'
    };
    return codes[secteur] || '6202A';
  }

  private getLibelleAPEBySecteur(secteur: string): string {
    const libelles: { [key: string]: string } = {
      'informatique': 'Conseil en systèmes et logiciels informatiques',
      'commerce': 'Vente à distance sur catalogue général',
      'industrie': 'Usinage, tournage, fraisage, ajustage',
      'batiment': 'Travaux de plâtrerie',
      'restauration': 'Restauration traditionnelle'
    };
    return libelles[secteur] || 'Conseil en systèmes et logiciels informatiques';
  }

  /**
   * Retourne une liste d'entreprises mock pour les tests
   */
  getMockEntreprises(): Entreprise[] {
    return Object.values(this.mockEntreprises);
  }
}

export default new SiretMockService(); 
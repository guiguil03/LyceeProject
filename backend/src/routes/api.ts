import express from 'express';
import matchingService, { MatchingCriteria } from '../services/matchingService';
import lyceeService from '../services/lyceeService';
import siretService from '../services/siretService';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Clé secrète pour JWT (en production, utilisez une variable d'environnement)
const JWT_SECRET = process.env.JWT_SECRET || 'votre-cle-secrete-jwt';

// Base de données simulée pour les utilisateurs (remplacer par une vraie DB)
const users: Array<{
  id: string;
  email: string;
  password: string;
  name: string;
  type: 'entreprise' | 'lycee';
  uai?: string; // Code UAI pour les lycées
  siret?: string; // SIRET pour les entreprises
}> = [];

// ================================
// ROUTES D'AUTHENTIFICATION
// ================================

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 */
router.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name, type, uai, siret } = req.body;

    if (!email || !password || !name || !type) {
      return res.status(400).json({
        success: false,
        error: 'Tous les champs sont obligatoires'
      });
    }

    // Validation spécifique selon le type
    if (type === 'lycee' && !uai) {
      return res.status(400).json({
        success: false,
        error: 'Le code UAI est obligatoire pour les lycées'
      });
    }

    if (type === 'entreprise' && !siret) {
      return res.status(400).json({
        success: false,
        error: 'Le SIRET est obligatoire pour les entreprises'
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const newUser = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email,
      password: hashedPassword,
      name,
      type: type as 'entreprise' | 'lycee',
      ...(type === 'lycee' && uai && { uai }),
      ...(type === 'entreprise' && siret && { siret })
    };

    users.push(newUser);

    // Créer le token JWT
    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email, 
        type: newUser.type,
        name: newUser.name,
        ...(newUser.uai && { uai: newUser.uai }),
        ...(newUser.siret && { siret: newUser.siret })
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        type: newUser.type,
        ...(newUser.uai && { uai: newUser.uai }),
        ...(newUser.siret && { siret: newUser.siret })
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

/**
 * POST /api/auth/login
 * Connexion d'un utilisateur
 */
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password, type } = req.body;

    if (!email || !password || !type) {
      return res.status(400).json({
        success: false,
        error: 'Email, mot de passe et type sont obligatoires'
      });
    }

    // Trouver l'utilisateur
    const user = users.find(u => u.email === email && u.type === type);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      });
    }

    // Créer le token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        type: user.type,
        name: user.name,
        ...(user.uai && { uai: user.uai }),
        ...(user.siret && { siret: user.siret })
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type,
        ...(user.uai && { uai: user.uai }),
        ...(user.siret && { siret: user.siret })
      }
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

/**
 * GET /api/auth/verify
 * Vérification d'un token JWT
 */
router.get('/auth/verify', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token d\'authentification manquant'
      });
    }

    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    res.json({
      success: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        type: decoded.type
      }
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Token invalide'
    });
  }
});

// ================================
// MIDDLEWARE D'AUTHENTIFICATION
// ================================

const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token d\'authentification manquant'
    });
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Token invalide'
    });
  }
};

// ================================
// ROUTES PROTÉGÉES
// ================================

/**
 * GET /api/auth/profile
 * Obtenir le profil de l'utilisateur connecté
 */
router.get('/auth/profile', authenticateToken, (req: any, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Route principale pour le frontend
router.post('/matching', async (req, res) => {
  try {
    console.log('🔍 Requête de matching reçue:', req.body);
    
    const criteria: MatchingCriteria = req.body;
    
    if (!criteria.entreprise?.siret && !criteria.entreprise?.secteurActivite) {
      return res.status(400).json({
        error: 'Veuillez fournir au minimum un SIRET ou un secteur d\'activité'
      });
    }

    const result = await matchingService.findMatchingLycees(criteria);
    
    console.log('✅ Résultat du matching:', result.matches?.length || 0, 'lycées trouvés');
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Erreur lors du matching:', error);
    res.status(500).json({
      error: 'Erreur lors de la recherche des lycées correspondants',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

// ================================
// ROUTES POUR LE MATCHING
// ================================

/**
 * POST /api/match/lycees
 * Trouve des lycées professionnels correspondant aux critères d'une entreprise
 */
router.post('/match/lycees', async (req, res) => {
  try {
    const criteria: MatchingCriteria = req.body;
    
    if (!criteria.entreprise?.siret && !criteria.entreprise?.secteurActivite) {
      return res.status(400).json({
        error: 'Veuillez fournir au minimum un SIRET ou un secteur d\'activité'
      });
    }

    const result = await matchingService.findMatchingLycees(criteria);
    
  res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erreur lors du matching des lycées:', error);
    res.status(500).json({
      error: 'Erreur lors de la recherche des lycées correspondants',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * GET /api/match/entreprises/:uai
 * Trouve des entreprises proches d'un lycée professionnel
 */
router.get('/match/entreprises/:uai', async (req, res) => {
  try {
    const { uai } = req.params;
    const distance = parseInt(req.query.distance as string) || 50;

    if (!uai) {
    return res.status(400).json({
        error: 'L\'UAI du lycée est requis'
      });
    }

    const result = await matchingService.findEntreprisesForLycee(uai, distance);
    
    if (!result.lycee) {
      return res.status(404).json({
        error: 'Lycée non trouvé'
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erreur lors de la recherche d\'entreprises:', error);
    res.status(500).json({
      error: 'Erreur lors de la recherche des entreprises',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

// ================================
// ROUTES POUR LES LYCÉES
// ================================

/**
 * GET /api/lycees/search
 * Recherche de lycées professionnels selon des critères
 */
router.get('/lycees/search', async (req, res) => {
  try {
    const {
      commune,
      departement,
      region,
      codePostal,
      formation,
      distance,
      latitude,
      longitude
    } = req.query;

    const searchParams = {
      commune: commune as string,
      departement: departement as string,
      region: region as string,
      codePostal: codePostal as string,
      formation: formation as string,
      distance: distance ? parseFloat(distance as string) : undefined,
      latitude: latitude ? parseFloat(latitude as string) : undefined,
      longitude: longitude ? parseFloat(longitude as string) : undefined
    };

    const lycees = await lyceeService.searchLycees(searchParams);
    
    res.json({
      success: true,
      data: lycees,
      count: lycees.length
    });
  } catch (error) {
    console.error('Erreur lors de la recherche de lycées:', error);
    res.status(500).json({
      error: 'Erreur lors de la recherche des lycées',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * GET /api/lycees/secteur/:secteur
 * Recherche de lycées par secteur d'activité
 */
router.get('/lycees/secteur/:secteur', async (req, res) => {
  try {
    const { secteur } = req.params;
    const {
      commune,
      departement,
      region,
      codePostal,
      distance,
      latitude,
      longitude
    } = req.query;

    const searchParams = {
      commune: commune as string,
      departement: departement as string,
      region: region as string,
      codePostal: codePostal as string,
      distance: distance ? parseFloat(distance as string) : undefined,
      latitude: latitude ? parseFloat(latitude as string) : undefined,
      longitude: longitude ? parseFloat(longitude as string) : undefined
    };

    const lycees = await lyceeService.searchLyceesBySector(secteur, searchParams);
    
    res.json({
      success: true,
      data: lycees,
      count: lycees.length,
      secteur
    });
  } catch (error) {
    console.error('Erreur lors de la recherche par secteur:', error);
    res.status(500).json({
      error: 'Erreur lors de la recherche des lycées par secteur',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * GET /api/lycees/:uai
 * Récupère les détails d'un lycée par son UAI
 */
router.get('/lycees/:uai', async (req, res) => {
  try {
    const { uai } = req.params;
    
    const lycee = await lyceeService.getLyceeByUAI(uai);
    
    if (!lycee) {
      return res.status(404).json({
        error: 'Lycée non trouvé'
      });
    }

    res.json({
      success: true,
      data: lycee
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du lycée:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du lycée',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

// ================================
// ROUTES POUR LES ENTREPRISES
// ================================

/**
 * GET /api/entreprises/search
 * Recherche d'entreprises selon des critères
 */
router.get('/entreprises/search', async (req, res) => {
  try {
    const {
      siret,
      siren,
      denominationSociale,
      commune,
      departement,
      codePostal,
      secteurActivite,
      codeAPE
    } = req.query;

    const searchParams = {
      siret: siret as string,
      siren: siren as string,
      denominationSociale: denominationSociale as string,
      commune: commune as string,
      departement: departement as string,
      codePostal: codePostal as string,
      secteurActivite: secteurActivite as string,
      codeAPE: codeAPE as string
    };

    const entreprises = await siretService.searchEntreprises(searchParams);
    
    res.json({
      success: true,
      data: entreprises,
      count: entreprises.length
    });
  } catch (error) {
    console.error('Erreur lors de la recherche d\'entreprises:', error);
    res.status(500).json({
      error: 'Erreur lors de la recherche des entreprises',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});


router.get('/entreprises/:siret', async (req, res) => {
  try {
    const { siret } = req.params;
    
    if (!/^\d{14}$/.test(siret)) {
      return res.status(400).json({
        error: 'Le SIRET doit contenir exactement 14 chiffres'
      });
    }
    
    const entreprise = await siretService.getEntrepriseBySiret(siret);
    
    if (!entreprise) {
      return res.status(404).json({
        error: 'Entreprise non trouvée'
      });
    }

    res.json({
      success: true,
      data: entreprise
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'entreprise:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération de l\'entreprise',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

// ================================
// ROUTES UTILITAIRES
// ================================

/**
 * GET /api/secteurs
 * Liste des secteurs d'activité supportés
 */
router.get('/secteurs', (req, res) => {
  const secteurs = [
    { code: 'informatique', libelle: 'Informatique et numérique' },
    { code: 'commerce', libelle: 'Commerce et vente' },
    { code: 'industrie', libelle: 'Industrie et mécanique' },
    { code: 'batiment', libelle: 'Bâtiment et travaux publics' },
    { code: 'restauration', libelle: 'Restauration et hôtellerie' },
    { code: 'transport', libelle: 'Transport et logistique' },
    { code: 'sante', libelle: 'Santé et social' },
    { code: 'agriculture', libelle: 'Agriculture' },
    { code: 'finance', libelle: 'Finance et assurance' },
    { code: 'immobilier', libelle: 'Immobilier' },
    { code: 'conseil', libelle: 'Conseil et services' }
  ];

  res.json({
    success: true,
    data: secteurs
  });
});

/**
 * GET /api/health
 * Vérification de l'état de l'API
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API de matching lycées-entreprises opérationnelle',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/test/lycees
 * Test simple de l'API des lycées
 */
router.get('/test/lycees', async (req, res) => {
  try {
    // Test 1: Recherche générale sans filtres
    console.log('🧪 Test 1: Recherche générale');
    const lyceesGeneraux = await lyceeService.searchLycees({});
    
    // Test 2: Recherche par département
    console.log('🧪 Test 2: Recherche par département Paris');
    const lyceesParis = await lyceeService.searchLycees({ 
      departement: 'Paris' 
    });
    
    // Test 3: Recherche par commune
    console.log('🧪 Test 3: Recherche par commune Meaux');
    const lyceesMeaux = await lyceeService.searchLycees({ 
      commune: 'Meaux' 
    });
    
    res.json({
      success: true,
      data: {
        general: {
          count: lyceesGeneraux.length,
          sample: lyceesGeneraux.slice(0, 2)
        },
        paris: {
          count: lyceesParis.length,
          sample: lyceesParis.slice(0, 2)
        },
        meaux: {
          count: lyceesMeaux.length,
          sample: lyceesMeaux.slice(0, 2)
        }
      }
    });
  } catch (error) {
    console.error('Erreur test lycées:', error);
    res.status(500).json({
      error: 'Erreur lors du test des lycées',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * GET /api/demo/sirets
 * Liste des SIRETs de démonstration disponibles
 */
router.get('/demo/sirets', (req, res) => {
  const demoSirets = [
    { siret: '78467169500015', description: 'TechSolutions Paris - Secteur informatique' },
    { siret: '12345678901234', description: 'CommerceMax SARL - Secteur commerce' },
    { siret: '98765432109876', description: 'Bâtiment Expert - Secteur bâtiment' }
  ];

  res.json({
    success: true,
    message: 'SIRETs de démonstration (en cas d\'indisponibilité de l\'API Sirene)',
    data: demoSirets,
    note: 'Ces SIRETs fonctionnent même quand l\'API Sirene est indisponible'
  });
});

/**
 * GET /api/demo/entreprises
 * Liste des entreprises de démonstration (désormais via API SIRENE réelle)
 */
router.get('/demo/entreprises', async (req, res) => {
  try {
    // SIRETs d'entreprises connues pour la démonstration
    const entreprisesDemo = [
      { nom: "Microsoft France", siret: "32737946700062", secteur: "Informatique" },
      { nom: "Carrefour", siret: "75402227500016", secteur: "Commerce" }, 
      { nom: "Renault", siret: "77556323200297", secteur: "Automobile" }
    ];

    res.json({
      success: true,
      data: entreprisesDemo,
      count: entreprisesDemo.length,
      message: "Entreprises de démonstration - utilisez ces SIRETs pour tester"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des entreprises de démonstration',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * POST /api/test/matching-simple
 * Test de matching avec paramètres simplifiés
 */
router.post('/test/matching-simple', async (req, res) => {
  try {
    console.log('🧪 Test de matching simple');
    
    // Test avec une recherche très simple
    const criteria = {
      entreprise: {
        secteurActivite: 'informatique',
        localisation: {
          commune: 'Paris'
        }
      },
      preferences: {
        distanceMax: 100,
        typeEtablissement: 'tous' as const,
        nombreResultats: 20
      }
    };
    
    console.log('📋 Critères de test:', JSON.stringify(criteria, null, 2));
    
    const result = await matchingService.findMatchingLycees(criteria);
    
    res.json({
      success: true,
      data: result,
      debug: {
        criteres: criteria,
        nombreMatches: result.matches.length,
        criteresUtilises: result.criteresUtilises
      }
    });
  } catch (error) {
    console.error('Erreur test matching:', error);
    res.status(500).json({
      error: 'Erreur lors du test de matching',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * GET /api/test/sirets-differents
 * Test des différents SIRETs pour vérifier qu'ils donnent des résultats différents
 */
router.get('/test/sirets-differents', async (req, res) => {
  try {
    console.log('🧪 Test avec différents SIRETs');
    
    const testSirets = ['78467169500015', '12345678901234', '98765432109876'];
    const results: any = {};
    
    for (const siret of testSirets) {
      console.log(`\n=== Test SIRET: ${siret} ===`);
      
      const criteria = {
        entreprise: {
          siret: siret
        },
        preferences: {
          distanceMax: 50,
          typeEtablissement: 'tous' as const,
          nombreResultats: 5
        }
      };
      
      const result = await matchingService.findMatchingLycees(criteria);
      
      results[siret] = {
        entreprise: result.entreprise?.denominationSociale || 'Non trouvée',
        commune: result.entreprise?.adresse?.commune || 'Non trouvée',
        departement: result.entreprise?.adresse?.departement || 'Non trouvé',
        nombreLycees: result.matches.length,
        premierLycee: result.matches[0]?.lycee?.nom_etablissement || 'Aucun',
        villesPremierLycees: result.matches.slice(0, 3).map(m => m.lycee.libelle_commune).join(', ') || 'Aucune',
        criteresUtilises: result.criteresUtilises
      };
    }
    
    res.json({
      success: true,
      message: 'Comparaison des résultats pour différents SIRETs',
      data: results,
      analyse: {
        sontDifferents: Object.keys(results).length > 1 && 
          new Set(Object.values(results).map((r: any) => r.commune)).size > 1,
        communesUniques: [...new Set(Object.values(results).map((r: any) => r.commune))],
        departementsUniques: [...new Set(Object.values(results).map((r: any) => r.departement))]
      }
    });
  } catch (error) {
    console.error('Erreur test SIRETs:', error);
    res.status(500).json({
      error: 'Erreur lors du test des SIRETs',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * GET /api/test/debug-geo
 * Test de débogage géolocalisation
 */
router.get('/test/debug-geo', async (req, res) => {
  try {
    console.log('🧪 Test DEBUG géolocalisation');
    
    // Test avec SIRET Paris
    const siretParis = '78467169500015';
    console.log('🔍 Test avec SIRET Paris:', siretParis);
    
    const entreprise = await siretService.getEntrepriseBySiret(siretParis);
    console.log('🏢 Entreprise trouvée:', entreprise ? {
      nom: entreprise.denominationSociale,
      commune: entreprise.adresse.commune,
      departement: entreprise.adresse.departement,
      coordinates: `${entreprise.coordonnees.latitude}, ${entreprise.coordonnees.longitude}`
    } : 'Non trouvée');
    
    if (entreprise) {
      // Test recherche lycées par commune
      console.log('🔍 Recherche lycées par commune:', entreprise.adresse.commune);
      const lyceesByCommune = await lyceeService.searchLycees({ 
        commune: entreprise.adresse.commune 
      });
      console.log('📍 Lycées trouvés par commune:', lyceesByCommune.length);
      
      // Test recherche lycées par département
      console.log('🔍 Recherche lycées par département:', entreprise.adresse.departement);
      const lyceesByDept = await lyceeService.searchLycees({ 
        departement: entreprise.adresse.departement 
      });
      console.log('📍 Lycées trouvés par département:', lyceesByDept.length);
      
      // Test recherche avec géolocalisation
      console.log('🔍 Recherche lycées avec géolocalisation (50km)');
      const lyceesGeo = await lyceeService.searchLycees({
        latitude: entreprise.coordonnees.latitude,
        longitude: entreprise.coordonnees.longitude,
        distance: 50
      });
      console.log('📍 Lycées trouvés par géoloc:', lyceesGeo.length);
      
      res.json({
        success: true,
        entreprise: {
          nom: entreprise.denominationSociale,
          commune: entreprise.adresse.commune,
          departement: entreprise.adresse.departement,
          coordinates: `${entreprise.coordonnees.latitude}, ${entreprise.coordonnees.longitude}`
        },
        tests: {
          parCommune: {
            critere: entreprise.adresse.commune,
            nombre: lyceesByCommune.length,
            premiers: lyceesByCommune.slice(0, 3).map(l => ({
              nom: l.nom_etablissement,
              commune: l.libelle_commune
            }))
          },
          parDepartement: {
            critere: entreprise.adresse.departement,
            nombre: lyceesByDept.length,
            premiers: lyceesByDept.slice(0, 3).map(l => ({
              nom: l.nom_etablissement,
              commune: l.libelle_commune
            }))
          },
          parGeolocalisation: {
            critere: '50km autour de Paris',
            nombre: lyceesGeo.length,
            premiers: lyceesGeo.slice(0, 3).map(l => ({
              nom: l.nom_etablissement,
              commune: l.libelle_commune
            }))
          }
        }
      });
    } else {
      res.json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }
    
  } catch (error) {
    console.error('Erreur test debug geo:', error);
    res.status(500).json({
      error: 'Erreur lors du test de géolocalisation',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * GET /api/test/siret/:siret
 * Test de la vraie API SIRENE publique
 */
router.get('/test/siret/:siret', async (req, res) => {
  try {
    const { siret } = req.params;
    console.log('🧪 TEST API SIRENE RÉELLE pour SIRET:', siret);
    
    const axios = require('axios');
    const SEARCH_URL = 'https://recherche-entreprises.api.gouv.fr/search';
    
    // Nettoyage du SIRET
    const siretClean = siret.replace(/[\s-]/g, '');
    
    if (siretClean.length !== 14) {
      return res.status(400).json({
        error: 'SIRET invalide',
        message: 'Le SIRET doit contenir 14 chiffres'
      });
    }

    console.log('📡 Appel API SIRENE:', `${SEARCH_URL}?q=${siretClean}&limite=1`);
    
    const response = await axios.get(SEARCH_URL, {
      params: {
        q: siretClean,
        limite: 1
      },
      timeout: 10000
    });

    console.log('📨 Réponse API brute:', {
      status: response.status,
      total: response.data?.total_results,
      results: response.data?.results?.length
    });

    if (response.data && response.data.results && response.data.results.length > 0) {
      const entrepriseData = response.data.results[0];
      
      console.log('✅ Entreprise trouvée:', entrepriseData);
      
      const siege = entrepriseData.siege || {};
      
      const entrepriseFormatee = {
        siret: entrepriseData.siret,
        siren: entrepriseData.siren,
        nom: entrepriseData.nom_complet || entrepriseData.nom_raison_sociale,
        activitePrincipale: entrepriseData.activite_principale,
        adresse: {
          numeroVoie: siege.numero_voie,
          typeVoie: siege.type_voie,
          libelleVoie: siege.libelle_voie,
          commune: siege.libelle_commune,
          codePostal: siege.code_postal,
          departement: siege.departement
        },
        coordonnees: {
          latitude: siege.latitude,
          longitude: siege.longitude
        },
        dateCreation: entrepriseData.date_creation,
        etatAdministratif: entrepriseData.etat_administratif
      };

      res.json({
        success: true,
        siretRecherche: siretClean,
        entreprise: entrepriseFormatee,
        donneesCompletes: entrepriseData
      });
    } else {
      console.log('❌ Aucune entreprise trouvée');
      res.json({
        success: false,
        message: 'Aucune entreprise trouvée pour ce SIRET',
        siretRecherche: siretClean
      });
    }

  } catch (error) {
    console.error('❌ Erreur test API SIRENE:', error);
    
    let errorMessage = 'Erreur lors du test API SIRENE';
    if (error instanceof Error) {
      errorMessage += ` - ${error.message}`;
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

/**
 * GET /api/test/sirene-config
 * Test de la configuration de l'API SIRENE
 */
router.get('/test/sirene-config', async (req, res) => {
  try {
    console.log('🧪 Test de la configuration API SIRENE...');
    
    // Vérification de la configuration
    const isConfigured = process.env.INSEE_API_KEY && process.env.INSEE_API_KEY !== 'VOTRE_CLE_API_INSEE';
    
    if (!isConfigured) {
      return res.json({
        success: false,
        error: 'API SIRENE non configurée',
        message: 'Ajoutez votre clé API INSEE dans le fichier .env ou directement dans le code',
        guide: 'Consultez backend/README-API-SIRENE.md'
      });
    }

    // Test avec un SIRET de Microsoft France
    const siretTest = '32737946700062'; // Microsoft France
    console.log('🔍 Test avec SIRET Microsoft France:', siretTest);
    
    const entreprise = await siretService.getEntrepriseBySiret(siretTest);
    
    if (entreprise) {
      res.json({
        success: true,
        message: '✅ API SIRENE configurée et fonctionnelle !',
        test: {
          siretTeste: siretTest,
          entrepriseTrouvee: {
            nom: entreprise.denominationSociale,
            secteur: entreprise.secteurActivite,
            commune: entreprise.adresse.commune,
            siret: entreprise.siret
          }
        },
        config: {
          apiKey: process.env.INSEE_API_KEY ? 'Configurée' : 'Non configurée',
          keyLength: process.env.INSEE_API_KEY?.length || 0
        }
      });
    } else {
      res.json({
        success: false,
        message: 'API configurée mais aucune entreprise trouvée pour le SIRET de test',
        siretTeste: siretTest
      });
    }

  } catch (error) {
    console.error('❌ Erreur test API SIRENE:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erreur lors du test de l\'API SIRENE',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      guide: 'Vérifiez votre clé API dans backend/README-API-SIRENE.md'
    });
  }
});

// ================================
// ROUTE DE DEBUG POUR LES LYCÉES
// ================================

/**
 * GET /api/debug/lycees
 * Debug : voir les lycées disponibles
 */
router.get('/debug/lycees', async (req, res) => {
  try {
    console.log('🔍 DEBUG: Récupération de tous les lycées...');
    const lycees = await lyceeService.searchLycees({});
    
    console.log(`📚 Total lycées trouvés: ${lycees.length}`);
    
    // Afficher les premiers lycées pour debug
    const debugInfo = lycees.slice(0, 5).map(lycee => ({
      nom: lycee.nom_etablissement,
      type: lycee.type_etablissement,
      commune: lycee.libelle_commune,
      departement: lycee.libelle_departement,
      formations: lycee.formations.slice(0, 10), // Limiter pour ne pas surcharger
      totalFormations: lycee.formations.length,
      texteAnalyse: [lycee.nom_etablissement, lycee.type_etablissement, ...lycee.formations].join(' ').toLowerCase().substring(0, 300)
    }));
    
    console.log('🏫 Premiers lycées:', debugInfo);
    
    res.json({
      success: true,
      data: {
        total: lycees.length,
        premier5: debugInfo,
        secteurs: {
          informatique: lycees.filter(l => 
            [l.nom_etablissement, l.type_etablissement, ...l.formations]
              .join(' ').toLowerCase()
              .includes('informatique')
          ).length,
          commerce: lycees.filter(l => 
            [l.nom_etablissement, l.type_etablissement, ...l.formations]
              .join(' ').toLowerCase()
              .includes('commerce')
          ).length,
          technique: lycees.filter(l => 
            [l.nom_etablissement, l.type_etablissement, ...l.formations]
              .join(' ').toLowerCase()
              .includes('technique')
          ).length,
          professionnel: lycees.filter(l => 
            [l.nom_etablissement, l.type_etablissement, ...l.formations]
              .join(' ').toLowerCase()
              .includes('professionnel')
          ).length
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur debug lycées:', error);
    res.status(500).json({
      error: 'Erreur lors du debug des lycées',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

export default router; 

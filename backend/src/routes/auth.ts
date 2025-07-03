import express, { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const authService = new AuthService();

// Route d'inscription
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, role, full_name, lycee_id, siret, nom_entreprise } = req.body;

    // Debug: Afficher les données reçues
    console.log('📝 Données reçues pour l\'inscription:', {
      email,
      password: password ? '***' : undefined,
      role,
      full_name,
      lycee_id,
      siret,
      nom_entreprise,
      body: req.body
    });

    // Validation des données requises
    if (!email || !password || !role || !full_name) {
      return res.status(400).json({
        error: 'Données manquantes',
        message: 'Email, mot de passe, rôle et nom complet sont requis'
      });
    }

    // Validation du rôle
    const validRoles = ['LYCEE_ADMIN', 'ENTREPRISE_ADMIN', 'SUPER_ADMIN'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: 'Rôle invalide',
        message: 'Le rôle doit être LYCEE_ADMIN, ENTREPRISE_ADMIN ou SUPER_ADMIN'
      });
    }

    // Pour les lycées, vérifier que le lycee_id est fourni
    if (role === 'LYCEE_ADMIN' && !lycee_id) {
      return res.status(400).json({
        error: 'ID lycée manquant',
        message: 'L\'ID du lycée est requis pour les administrateurs de lycée'
      });
    }

    // Pour les entreprises, vérifier que le SIRET est fourni
    if (role === 'ENTREPRISE_ADMIN' && !siret) {
      return res.status(400).json({
        error: 'SIRET manquant',
        message: 'Le SIRET de l\'entreprise est requis pour les administrateurs d\'entreprise'
      });
    }

    // Créer l'utilisateur
    const result = await authService.register({
      email,
      password,
      role,
      full_name,
      lycee_id,
      siret,
      nom_entreprise
    });

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      user: result.user,
      token: result.token
    });

  } catch (error: any) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message || 'Une erreur est survenue lors de l\'inscription'
    });
  }
});

// Route de connexion
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation des données
    if (!email || !password) {
      return res.status(400).json({
        error: 'Données manquantes',
        message: 'Email et mot de passe sont requis'
      });
    }

    // Authentifier l'utilisateur
    const result = await authService.login({ email, password });

    res.json({
      success: true,
      message: 'Connexion réussie',
      user: result.user,
      token: result.token
    });

  } catch (error: any) {
    console.error('Erreur lors de la connexion:', error);
    res.status(401).json({
      error: 'Authentification échouée',
      message: error.message || 'Email ou mot de passe incorrect'
    });
  }
});

// Route de vérification du token
router.get('/verify', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Le middleware authenticateToken a déjà vérifié le token
    // et ajouté les informations utilisateur à req.user
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        error: 'Utilisateur non trouvé',
        message: 'Token invalide'
      });
    }

    res.json({
      success: true,
      message: 'Token valide',
      user: {
        id: user.id,
        email: user.email,
        role: user.role || user.type_utilisateur,
        full_name: user.full_name || `${user.nom} ${user.prenom}`,
        lycee_id: user.lycee_id,
        entreprise_id: user.entreprise_id
      }
    });

  } catch (error: any) {
    console.error('Erreur lors de la vérification:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la vérification'
    });
  }
});

// Route de déconnexion (optionnelle côté serveur)
router.post('/logout', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Pour une vraie déconnexion, on pourrait ajouter le token à une blacklist
    // Pour l'instant, on laisse le client gérer la suppression du token
    
    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });

  } catch (error: any) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la déconnexion'
    });
  }
});

export default router;

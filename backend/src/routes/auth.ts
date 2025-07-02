import express from 'express';
import { registerUser, loginUser, getUserProfile, verifyToken } from '../services/authService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Route de connexion
router.post('/login', async (req, res) => {
  try {
    console.log('🔄 Requête de connexion reçue:', { email: req.body.email });
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email et mot de passe requis',
        message: 'Veuillez fournir un email et un mot de passe'
      });
    }

    const result = await loginUser({ email, password });
    
    console.log('✅ Connexion réussie pour:', result.data.user.email);
    res.json(result);

  } catch (error: any) {
    console.error('❌ Erreur de connexion:', error.message);
    res.status(400).json({
      success: false,
      error: 'Erreur de connexion',
      message: error.message
    });
  }
});

// Route d'inscription entreprise
router.post('/register/entreprise', async (req, res) => {
  try {
    console.log('🔄 Requête d\'inscription entreprise reçue:', { email: req.body.email });
    console.log('📋 Données reçues:', req.body);
    
    const { email, password, full_name } = req.body;

    // Validation des champs requis (seulement les essentiels)
    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        error: 'Champs manquants',
        message: 'Email, mot de passe et nom complet sont requis'
      });
    }

    const result = await registerUser({
      email,
      password,
      role: 'entreprise',
      full_name
    });
    
    console.log('✅ Inscription entreprise réussie pour:', result.data.user.email);
    res.status(201).json(result);

  } catch (error: any) {
    console.error('❌ Erreur d\'inscription entreprise:', error.message);
    res.status(400).json({
      success: false,
      error: 'Échec de l\'inscription',
      message: error.message
    });
  }
});

// Route d'inscription lycée
router.post('/register/lycee', async (req, res) => {
  try {
    console.log('🔄 Requête d\'inscription lycée reçue:', { email: req.body.rbdeEmail });
    console.log('📋 Données reçues:', req.body);
    
    const { rbdeEmail, password, full_name } = req.body;

    // Validation des champs requis (seulement les essentiels)
    if (!rbdeEmail || !password || !full_name) {
      return res.status(400).json({
        success: false,
        error: 'Champs manquants',
        message: 'Email, mot de passe et nom complet sont requis'
      });
    }

    const result = await registerUser({
      email: rbdeEmail,
      password,
      role: 'rbde',
      full_name
    });
    
    console.log('✅ Inscription lycée réussie pour:', result.data.user.email);
    res.status(201).json(result);

  } catch (error: any) {
    console.error('❌ Erreur d\'inscription lycée:', error.message);
    res.status(400).json({
      success: false,
      error: 'Échec de l\'inscription',
      message: error.message
    });
  }
});

// Route de vérification de token
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Token valide',
      data: {
        user: req.user
      }
    });
  } catch (error: any) {
    console.error('❌ Erreur de vérification:', error.message);
    res.status(401).json({
      success: false,
      error: 'Token invalide',
      message: error.message
    });
  }
});

// Route de récupération du profil
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Non autorisé',
        message: 'Token invalide'
      });
    }

    const user = await getUserProfile(userId);
    
    res.json({
      success: true,
      message: 'Profil récupéré avec succès',
      data: {
        user
      }
    });
  } catch (error: any) {
    console.error('❌ Erreur de récupération du profil:', error.message);
    res.status(404).json({
      success: false,
      error: 'Utilisateur non trouvé',
      message: error.message
    });
  }
});

// Route de déconnexion
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Avec JWT, la déconnexion côté serveur est optionnelle
    // Le token sera invalidé côté client
    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error: any) {
    console.error('❌ Erreur de déconnexion:', error.message);
    res.status(400).json({
      success: false,
      error: 'Erreur de déconnexion',
      message: error.message
    });
  }
});

export default router; 
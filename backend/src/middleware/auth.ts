import { Request, Response, NextFunction } from 'express';
import { verifyToken, getUserById } from '../services/authService';

// Extension de l'interface Request pour inclure l'utilisateur
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Middleware d'authentification
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Token d\'accès requis',
        message: 'Vous devez être connecté pour accéder à cette ressource'
      });
    }

    // Vérifier le token
    const decoded = verifyToken(token);
    
    // Récupérer les informations utilisateur actualisées
    const user = await getUserById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Utilisateur non trouvé',
        message: 'Le token fait référence à un utilisateur qui n\'existe plus'
      });
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return res.status(403).json({ 
      error: 'Token invalide',
      message: 'Le token fourni n\'est pas valide ou a expiré'
    });
  }
};

// Middleware pour vérifier les rôles
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Non authentifié',
        message: 'Vous devez être connecté'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Accès non autorisé',
        message: `Cette action nécessite l'un des rôles suivants: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Middleware pour vérifier que l'utilisateur est une entreprise
export const requireEntreprise = requireRole(['entreprise']);

// Middleware pour vérifier que l'utilisateur est un RBDE
export const requireRBDE = requireRole(['rbde']);

// Middleware pour vérifier que l'utilisateur est admin
export const requireAdmin = requireRole(['admin']);

// Middleware optionnel d'authentification (n'interrompt pas si pas de token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      const user = await getUserById(decoded.id);
      
      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // Ignorer les erreurs pour l'auth optionnelle
  }
  
  next();
}; 
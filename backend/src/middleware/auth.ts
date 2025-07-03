import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
    lycee_id?: number;
    entreprise_id?: number;
    // Compatibilité avec l'ancienne interface
    id?: number;
    nom?: string;
    prenom?: string;
    type_utilisateur?: string;
    siret?: string;
    nom_entreprise?: string;
    full_name?: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Token manquant',
      message: 'Token d\'authentification requis'
    });
  }

  const jwtSecret = process.env.JWT_SECRET || 'votre-secret-jwt-super-secret';

  jwt.verify(token, jwtSecret, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({
        error: 'Token invalide',
        message: 'Le token d\'authentification est invalide ou expiré'
      });
    }

    // Normaliser les données utilisateur
    req.user = {
      userId: decoded.userId,
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      type_utilisateur: decoded.role,
      lycee_id: decoded.lycee_id,
      entreprise_id: decoded.entreprise_id,
      full_name: decoded.full_name,
      nom: decoded.nom,
      prenom: decoded.prenom,
      siret: decoded.siret,
      nom_entreprise: decoded.nom_entreprise
    };
    
    next();
  });
};

export { AuthRequest };

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from './databaseService';
import type { User, LoginRequest, RegisterRequest, LoginResponse } from '../types/database';

export class AuthService {
  private jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
  }

  // Générer un token JWT
  generateToken(user: Omit<User, 'password_hash'>): string {
    return jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
        lycee_id: user.lycee_id,
        entreprise_id: user.entreprise_id
      },
      this.jwtSecret,
      { expiresIn: '24h' }
    );
  }

  // Vérifier un token JWT
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Token invalide');
    }
  }

  // Hasher un mot de passe
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Vérifier un mot de passe
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Connexion
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { email, password } = credentials;

    // Récupérer l'utilisateur par email
    const query = `
      SELECT 
        u.*,
        l.nom as lycee_nom,
        e.nom as entreprise_nom
      FROM "User" u
      LEFT JOIN "Lycee" l ON u.lycee_id = l.id
      LEFT JOIN "Entreprise" e ON u.entreprise_id = e.id
      WHERE u.email = $1 AND u.is_active = true
    `;

    const result = await db.query(query, [email]);

    if (result.rows.length === 0) {
      throw new Error('Email ou mot de passe incorrect');
    }

    const user = result.rows[0];

    // Vérifier le mot de passe
    const isValidPassword = await this.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Mettre à jour la date de dernière connexion
    await db.query(
      'UPDATE "User" SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Préparer les données utilisateur (sans le mot de passe)
    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      lycee_id: user.lycee_id,
      entreprise_id: user.entreprise_id,
      is_active: user.is_active,
      last_login: new Date(),
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    // Générer le token
    const token = this.generateToken(userWithoutPassword);

    return {
      user: userWithoutPassword,
      token,
      expires_in: 24 * 60 * 60 // 24 heures en secondes
    };
  }

  // Inscription
  async register(userData: RegisterRequest): Promise<LoginResponse> {
    const { email, password, role, full_name, lycee_id, entreprise_id, siret, nom_entreprise } = userData;

    // Vérifier si l'email existe déjà
    const existingUser = await db.query(
      'SELECT id FROM "User" WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('Un compte avec cet email existe déjà');
    }

    // Valider le rôle
    if (!['LYCEE_ADMIN', 'ENTREPRISE_ADMIN', 'SUPER_ADMIN'].includes(role)) {
      throw new Error('Rôle invalide');
    }

    let finalEntrepriseId = entreprise_id;
    let finalLyceeId = lycee_id;

    // Valider la cohérence rôle/établissement
    if (role === 'LYCEE_ADMIN' && !lycee_id) {
      throw new Error('Un ID de lycée est requis pour un administrateur de lycée');
    }
    
    if (role === 'LYCEE_ADMIN' && lycee_id) {
      // Pour les lycées, vérifier si lycee_id est un UUID ou un code UAI
      if (!this.isValidUUID(lycee_id)) {
        // C'est probablement un code UAI, chercher le lycée correspondant
        const existingLycee = await db.query(
          'SELECT id FROM "Lycee" WHERE uai = $1',
          [lycee_id]
        );
        
        if (existingLycee.rows.length > 0) {
          // Le lycée existe déjà
          finalLyceeId = existingLycee.rows[0].id;
        } else {
          // Créer un lycée temporaire avec ce code UAI
          const nom = full_name ? `Lycée ${full_name}` : `Lycée ${lycee_id}`;
          const insertLyceeQuery = `
            INSERT INTO "Lycee" (nom, uai, created_at, updated_at)
            VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id
          `;
          
          const newLycee = await db.query(insertLyceeQuery, [nom, lycee_id]);
          finalLyceeId = newLycee.rows[0].id;
        }
      }
    }
    
    if (role === 'ENTREPRISE_ADMIN') {
      // Pour les entreprises, accepter soit un ID soit un SIRET
      if (!entreprise_id && !siret) {
        throw new Error('Un SIRET ou un ID d\'entreprise est requis pour un administrateur d\'entreprise');
      }
      
      // Si on a un SIRET, chercher ou créer l'entreprise
      if (siret && !entreprise_id) {
        // Chercher si l'entreprise existe déjà
        const existingEntreprise = await db.query(
          'SELECT id FROM "Entreprise" WHERE siret = $1',
          [siret]
        );
        
        if (existingEntreprise.rows.length > 0) {
          // L'entreprise existe déjà
          finalEntrepriseId = existingEntreprise.rows[0].id;
        } else {
          // Créer une nouvelle entreprise
          const nom = nom_entreprise || `Entreprise ${siret}`;
          const insertEntrepriseQuery = `
            INSERT INTO "Entreprise" (nom, siret, created_at, updated_at)
            VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id
          `;
          
          const newEntreprise = await db.query(insertEntrepriseQuery, [nom, siret]);
          finalEntrepriseId = newEntreprise.rows[0].id;
        }
      }
    }

    // Hasher le mot de passe
    const hashedPassword = await this.hashPassword(password);

    // Créer l'utilisateur
    const insertQuery = `
      INSERT INTO "User" (
        email, password_hash, role, full_name, lycee_id, entreprise_id, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING id, email, role, full_name, lycee_id, entreprise_id, is_active, created_at, updated_at
    `;

    const result = await db.query(insertQuery, [
      email,
      hashedPassword,
      role,
      full_name,
      finalLyceeId,
      finalEntrepriseId
    ]);

    const newUser = result.rows[0];

    // Générer le token
    const token = this.generateToken(newUser);

    return {
      user: newUser,
      token,
      expires_in: 24 * 60 * 60 // 24 heures en secondes
    };
  }

  // Récupérer un utilisateur par ID
  async getUserById(userId: string): Promise<Omit<User, 'password_hash'> | null> {
    const query = `
      SELECT 
        u.id, u.email, u.role, u.full_name, u.lycee_id, u.entreprise_id, 
        u.is_active, u.last_login, u.created_at, u.updated_at,
        l.nom as lycee_nom,
        e.nom as entreprise_nom
      FROM "User" u
      LEFT JOIN "Lycee" l ON u.lycee_id = l.id
      LEFT JOIN "Entreprise" e ON u.entreprise_id = e.id
      WHERE u.id = $1 AND u.is_active = true
    `;

    const result = await db.query(query, [userId]);

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      lycee_id: user.lycee_id,
      entreprise_id: user.entreprise_id,
      is_active: user.is_active,
      last_login: user.last_login,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  }

  /**
   * Vérifie si une chaîne est un UUID valide
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}

export default AuthService;

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import pool from '../config/database';

// Interfaces simplifiées basées sur la table User
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'rbde' | 'entreprise';
  full_name?: string;
  lycee_id?: string;
  created_at: string;
}

export interface RegisterUserData {
  email: string;
  password: string;
  role: 'entreprise' | 'rbde';
  full_name?: string;
  lycee_id?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Générer un token JWT
export const generateToken = (userId: string, role: string): string => {
  return (jwt as any).sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Vérifier un token JWT
export const verifyToken = (token: string): any => {
  return (jwt as any).verify(token, JWT_SECRET);
};

// Hasher un mot de passe
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Vérifier un mot de passe
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// Inscription utilisateur (entreprise ou lycée)
export const registerUser = async (userData: RegisterUserData): Promise<AuthResponse> => {
  try {
    console.log('🔄 Début de l\'inscription utilisateur:', { email: userData.email, role: userData.role });

    // Vérifier si l'email existe déjà
    const existingUser = await pool.query(
      'SELECT id FROM "User" WHERE email = $1',
      [userData.email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('Cet email est déjà utilisé');
    }

    // Validation du mot de passe
    if (userData.password.length < 8) {
      throw new Error('Le mot de passe doit contenir au moins 8 caractères');
    }

    // Hasher le mot de passe
    const passwordHash = await hashPassword(userData.password);

    // Insérer le nouvel utilisateur
    const result = await pool.query(
      `INSERT INTO "User" (email, password_hash, role, full_name, lycee_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, role, full_name, lycee_id, created_at`,
      [
        userData.email,
        passwordHash,
        userData.role,
        userData.full_name || null,
        userData.lycee_id || null
      ]
    );

    const newUser = result.rows[0];
    console.log('✅ Utilisateur créé avec succès:', { id: newUser.id, email: newUser.email, role: newUser.role });

    // Générer le token
    const token = generateToken(newUser.id, newUser.role);

    return {
      success: true,
      message: 'Inscription réussie',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          full_name: newUser.full_name,
          lycee_id: newUser.lycee_id,
          created_at: newUser.created_at
        },
        token
      }
    };

  } catch (error: any) {
    console.error('❌ Erreur lors de l\'inscription:', error.message);
    throw error;
  }
};

// Connexion utilisateur
export const loginUser = async (loginData: LoginData): Promise<AuthResponse> => {
  try {
    console.log('🔄 Tentative de connexion pour:', loginData.email);

    // Récupérer l'utilisateur
    const result = await pool.query(
      'SELECT id, email, password_hash, role, full_name, lycee_id, created_at FROM "User" WHERE email = $1',
      [loginData.email]
    );

    if (result.rows.length === 0) {
      throw new Error('Email ou mot de passe incorrect');
    }

    const user = result.rows[0];

    // Vérifier le mot de passe
    const isValidPassword = await verifyPassword(loginData.password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Email ou mot de passe incorrect');
    }

    console.log('✅ Connexion réussie pour:', { id: user.id, email: user.email, role: user.role });

    // Générer le token
    const token = generateToken(user.id, user.role);

    return {
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          full_name: user.full_name,
          lycee_id: user.lycee_id,
          created_at: user.created_at
        },
        token
      }
    };

  } catch (error: any) {
    console.error('❌ Erreur lors de la connexion:', error.message);
    throw error;
  }
};

// Récupérer un utilisateur par ID
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const result = await pool.query(
      'SELECT id, email, role, full_name, lycee_id, created_at FROM "User" WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error.message);
    throw error;
  }
};

// Récupérer le profil utilisateur
export const getUserProfile = async (userId: string): Promise<User> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }
  return user;
}; 